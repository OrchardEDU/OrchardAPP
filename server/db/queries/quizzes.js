import { pool } from '../connection.js';

/**
 * Get quizzes for a course
 */
export async function getQuizzesForCourse(courseId, userId, role) {
	if (role === 'teacher') {
		// Teachers see all quizzes
		const result = await pool.query(
			`SELECT 
				q.id, q.course_id, q.title, q.description, q.published, q.due_date,
				q.created_at, q.updated_at,
				COUNT(DISTINCT qu.id) as question_count,
				COUNT(DISTINCT s.id) as submission_count
			FROM quizzes q
			LEFT JOIN questions qu ON q.id = qu.quiz_id
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
				q.id, q.course_id, q.title, q.description, q.published, q.due_date,
				q.created_at, q.updated_at,
				COUNT(DISTINCT qu.id) as question_count,
				EXISTS(SELECT 1 FROM submissions WHERE quiz_id = q.id AND student_id = $2) as has_submission
			FROM quizzes q
			LEFT JOIN questions qu ON q.id = qu.quiz_id
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
	
	// Get questions
	const questionsResult = await pool.query(
		'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC',
		[quizId]
	);
	
	// Hide correct answers for students
	if (role === 'student') {
		questionsResult.rows.forEach(q => {
			q.correct_answer = null;
		});
	}
	
	quiz.questions = questionsResult.rows;
	
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
		const quizResult = await client.query(
			`INSERT INTO quizzes (course_id, title, description, published, due_date)
			 VALUES ($1, $2, $3, $4, $5)
			 RETURNING *`,
			[courseId, title, description, published, dueDate]
		);
		
		const quiz = quizResult.rows[0];
		
		// Insert questions
		if (questions && questions.length > 0) {
			for (let i = 0; i < questions.length; i++) {
				const q = questions[i];
				await client.query(
					`INSERT INTO questions (quiz_id, type, question, options, correct_answer, points, order_index)
					 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
					[quiz.id, q.type, q.question, JSON.stringify(q.options || null), q.correctAnswer, q.points, i]
				);
			}
		}
		
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
		const quizResult = await client.query(
			`UPDATE quizzes 
			 SET title = COALESCE($1, title),
			     description = COALESCE($2, description),
			     published = COALESCE($3, published),
			     due_date = COALESCE($4, due_date),
			     updated_at = CURRENT_TIMESTAMP
			 WHERE id = $5
			 RETURNING *`,
			[title, description, published, dueDate, quizId]
		);
		
		if (quizResult.rows.length === 0) {
			await client.query('ROLLBACK');
			return null;
		}
		
		// Delete existing questions
		await client.query('DELETE FROM questions WHERE quiz_id = $1', [quizId]);
		
		// Insert new questions
		if (questions && questions.length > 0) {
			for (let i = 0; i < questions.length; i++) {
				const q = questions[i];
				await client.query(
					`INSERT INTO questions (quiz_id, type, question, options, correct_answer, points, order_index)
					 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
					[quizId, q.type, q.question, JSON.stringify(q.options || null), q.correctAnswer, q.points, i]
				);
			}
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
	
	if (quiz.has_submission) {
		return { canSubmit: false, reason: 'Already submitted' };
	}
	
	if (quiz.due_date) {
		const dueDate = new Date(quiz.due_date);
		if (dueDate < new Date()) {
			return { canSubmit: false, reason: 'Quiz is past due' };
		}
	}
	
	return { canSubmit: true };
}
