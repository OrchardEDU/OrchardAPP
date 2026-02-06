import { pool } from '../connection.js';

/**
 * Get quizzes for a course
 */
export async function getQuizzesForCourse(courseId, userId, role) {
	if (role === 'teacher') {
		// Teachers see all quizzes
		const result = await pool.query(
			`SELECT 
				q.id, q.course_id, q.title, q.description, q.published, q.due_date, q.questions_json,
				q.created_at, q.updated_at,
				COALESCE(jsonb_array_length(q.questions_json), 0) as question_count,
				COUNT(DISTINCT s.id) as submission_count
			FROM quizzes q
			LEFT JOIN submissions s ON q.id = s.quiz_id
			WHERE q.course_id = $1
			GROUP BY q.id
			ORDER BY q.created_at DESC`,
			[courseId]
		);
		return result.rows;
	} else {
		// Students only see published quizzes
		const result = await pool.query(
			`SELECT 
				q.id, q.course_id, q.title, q.description, q.published, q.due_date, q.questions_json,
				q.created_at, q.updated_at,
				COALESCE(jsonb_array_length(q.questions_json), 0) as question_count,
				EXISTS(SELECT 1 FROM submissions WHERE quiz_id = q.id AND student_id = $2) as has_submission
			FROM quizzes q
			WHERE q.course_id = $1 AND q.published = true
			GROUP BY q.id
			ORDER BY q.created_at DESC`,
			[courseId, userId]
		);
		return result.rows;
	}
}

/**
 * Get quiz by ID with questions
 */
export async function getQuizById(quizId, userId, role) {
	// Get quiz
	const quizResult = await pool.query(
		'SELECT * FROM quizzes WHERE id = $1',
		[quizId]
	);
	
	if (quizResult.rows.length === 0) {
		return null;
	}
	
	const quiz = quizResult.rows[0];

	// Questions are stored as JSONB on the quiz
	const rawQuestions = Array.isArray(quiz.questions_json) ? quiz.questions_json : [];
	const normalizedQuestions = rawQuestions.map((q, index) => ({
		question: typeof q.question === 'string' ? q.question : '',
		points: typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0,
		orderIndex: typeof q.orderIndex === 'number' ? q.orderIndex : index,
	}));

	quiz.questions = normalizedQuestions;
	
	// Check submission status for students
	if (role === 'student') {
		const submissionResult = await pool.query(
			'SELECT id FROM submissions WHERE quiz_id = $1 AND student_id = $2',
			[quizId, userId]
		);
		quiz.hasSubmission = submissionResult.rows.length > 0;
	}
	
	return quiz;
}

/**
 * Create quiz with questions (transaction)
 */
export async function createQuiz(courseId, title, description, published, dueDate, questions) {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		// Insert quiz
		const normalizedQuestions = Array.isArray(questions)
			? questions.map((q, index) => ({
					question: typeof q.question === 'string' ? q.question : '',
					points: typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0,
					orderIndex: index,
			  }))
			: [];

		const quizResult = await client.query(
			`INSERT INTO quizzes (course_id, title, description, published, due_date, questions_json)
			 VALUES ($1, $2, $3, $4, $5, $6)
			 RETURNING *`,
			[courseId, title, description, published, dueDate, JSON.stringify(normalizedQuestions)]
		);
		
		const quiz = quizResult.rows[0];
		
		await client.query('COMMIT');
		
		// Fetch complete quiz with questions
		return await getQuizById(quiz.id, null, 'teacher');
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

/**
 * Update quiz with questions (transaction)
 */
export async function updateQuiz(quizId, title, description, published, dueDate, questions) {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		// Update quiz
		const normalizedQuestions = Array.isArray(questions)
			? questions.map((q, index) => ({
					question: typeof q.question === 'string' ? q.question : '',
					points: typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0,
					orderIndex: index,
			  }))
			: null;

		const quizResult = await client.query(
			`UPDATE quizzes 
			 SET title = COALESCE($1, title),
			     description = COALESCE($2, description),
			     published = COALESCE($3, published),
			     due_date = COALESCE($4, due_date),
			     questions_json = COALESCE($5, questions_json),
			     updated_at = CURRENT_TIMESTAMP
			 WHERE id = $6
			 RETURNING *`,
			[title, description, published, dueDate, normalizedQuestions ? JSON.stringify(normalizedQuestions) : null, quizId]
		);
		
		if (quizResult.rows.length === 0) {
			await client.query('ROLLBACK');
			return null;
		}
		
		await client.query('COMMIT');
		
		// Fetch complete quiz with questions
		return await getQuizById(quizId, null, 'teacher');
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

/**
 * Check if quiz is published and not past due
 */
export async function canSubmitQuiz(quizId, studentId) {
	const result = await pool.query(
		`SELECT published, due_date,
		 EXISTS(SELECT 1 FROM submissions WHERE quiz_id = $1 AND student_id = $2) as has_submission
		FROM quizzes WHERE id = $1`,
		[quizId, studentId]
	);
	
	if (result.rows.length === 0) {
		return { canSubmit: false, reason: 'Quiz not found' };
	}
	
	const quiz = result.rows[0];
	
	if (!quiz.published) {
		return { canSubmit: false, reason: 'Quiz is not published' };
	}
	
	if (quiz.due_date) {
		const dueDate = new Date(quiz.due_date);
		if (dueDate < new Date()) {
			return { canSubmit: false, reason: 'Quiz is past due' };
		}
	}
	
	return { canSubmit: true };
}
