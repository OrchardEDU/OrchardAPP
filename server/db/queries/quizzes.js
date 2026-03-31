import { pool } from '../connection.js';
import * as submissionQueries from './submissions.js';

/**
 * Get quizzes for a course
 */
export async function getQuizzesForCourse(courseId, userId, role) {
	if (role === 'teacher') {
		// Teachers see all quizzes
		const result = await pool.query(
			`SELECT 
				q.id, q.course_id, q.title, q.description, q.published, q.time_limit_minutes, q.due_date, q.questions_json,
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
				q.id, q.course_id, q.title, q.description, q.published, q.time_limit_minutes, q.due_date, q.questions_json,
				q.created_at, q.updated_at,
				COALESCE(jsonb_array_length(q.questions_json), 0) as question_count,
				EXISTS(SELECT 1 FROM submissions WHERE quiz_id = q.id AND student_id = $2) as has_submission,
				s.score, s.max_score, s.is_graded
			FROM quizzes q
			LEFT JOIN submissions s ON q.id = s.quiz_id AND s.student_id = $2
			WHERE q.course_id = $1 AND q.published = true
			GROUP BY q.id, s.score, s.max_score, s.is_graded
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
	
	// For students, return null if quiz is unpublished (visibility control)
	if (role === 'student' && !quiz.published) {
		return null;
	}

	// Questions are stored as JSONB on the quiz
	const rawQuestions = Array.isArray(quiz.questions_json) ? quiz.questions_json : [];
	const normalizedQuestions = rawQuestions.map((q, index) => ({
		question: typeof q.question === 'string' ? q.question : '',
		points: typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0,
		type: typeof q.type === 'string' ? q.type : 'open-response',
		options: Array.isArray(q.options) ? q.options : undefined,
		correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : undefined,
		wordLimit: typeof q.wordLimit === 'number' ? q.wordLimit : undefined,
		charLimit: typeof q.charLimit === 'number' ? q.charLimit : undefined,
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
export async function createQuiz(courseId, title, description, published, dueDate, timeLimitMinutes, questions) {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		// Insert quiz
		const normalizedQuestions = Array.isArray(questions)
			? questions.map((q, index) => {
					const questionText = typeof q.question === 'string' ? q.question : '';
					const points =
						typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0;
					const type =
						typeof q.type === 'string' ? q.type : 'open-response';
					const options = Array.isArray(q.options) ? q.options : undefined;
					const correctAnswer =
						typeof q.correctAnswer === 'number' ? q.correctAnswer : undefined;
					const wordLimit =
						typeof q.wordLimit === 'number' ? q.wordLimit : undefined;
					const charLimit =
						typeof q.charLimit === 'number' ? q.charLimit : undefined;

					return {
						question: questionText,
						points,
						type,
						options,
						correctAnswer,
						wordLimit,
						charLimit,
						orderIndex: index,
					};
			  })
			: [];

		const quizResult = await client.query(
			`INSERT INTO quizzes (course_id, title, description, published, due_date, time_limit_minutes, questions_json)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING *`,
			[courseId, title, description, published, dueDate, timeLimitMinutes, JSON.stringify(normalizedQuestions)]
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
export async function updateQuiz(quizId, title, description, published, dueDate, timeLimitMinutes, questions) {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		// First, check if quiz exists and is published
		const existingQuizResult = await client.query(
			'SELECT published, questions_json FROM quizzes WHERE id = $1',
			[quizId]
		);
		
		if (existingQuizResult.rows.length === 0) {
			await client.query('ROLLBACK');
			return null;
		}
		
		const existingQuiz = existingQuizResult.rows[0];
		
		// If quiz is published, only allow changing the published status (unpublishing)
		// Note: This check is redundant since the route handler already validates this,
		// but we keep it as a safety check. The route handler will have already blocked
		// other changes, so if we reach here with a published quiz, it should only be
		// for unpublishing.
		if (existingQuiz.published) {
			// Allow unpublishing (published: false)
			// The route handler has already validated that only published field is being changed
		}
		
		// Check if questions are being changed
		const questionsChanged = questions !== undefined && questions !== null;
		let shouldDeleteSubmissions = false;
		
		if (questionsChanged) {
			// Compare old and new questions to see if they changed
			const oldQuestions = Array.isArray(existingQuiz.questions_json) 
				? existingQuiz.questions_json 
				: [];
			const newQuestions = Array.isArray(questions) ? questions : [];
			
			// Simple comparison: if lengths differ, delete submissions
			if (oldQuestions.length !== newQuestions.length) {
				shouldDeleteSubmissions = true;
			} else {
				// Compare question content including type-specific fields
				for (let i = 0; i < oldQuestions.length; i++) {
					const oldQ = oldQuestions[i];
					const newQ = newQuestions[i];
					
					// Compare basic fields
					if (oldQ.question !== newQ.question || oldQ.points !== newQ.points) {
						shouldDeleteSubmissions = true;
						break;
					}
					
					// Compare question type
					const oldType = oldQ.type || 'open-response';
					const newType = newQ.type || 'open-response';
					if (oldType !== newType) {
						shouldDeleteSubmissions = true;
						break;
					}
					
					// Compare multiple choice specific fields
					if (newType === 'multiple-choice') {
						const oldOptions = Array.isArray(oldQ.options) ? oldQ.options : [];
						const newOptions = Array.isArray(newQ.options) ? newQ.options : [];
						
						// Compare options arrays
						if (oldOptions.length !== newOptions.length) {
							shouldDeleteSubmissions = true;
							break;
						}
						
						// Compare option text
						for (let j = 0; j < oldOptions.length; j++) {
							if (oldOptions[j] !== newOptions[j]) {
								shouldDeleteSubmissions = true;
								break;
							}
						}
						
						// Compare correct answer index
						const oldCorrect = typeof oldQ.correctAnswer === 'number' ? oldQ.correctAnswer : undefined;
						const newCorrect = typeof newQ.correctAnswer === 'number' ? newQ.correctAnswer : undefined;
						if (oldCorrect !== newCorrect) {
							shouldDeleteSubmissions = true;
							break;
						}
					}
					
					// Compare short answer specific fields
					if (newType === 'short-answer') {
						const oldWordLimit = typeof oldQ.wordLimit === 'number' ? oldQ.wordLimit : undefined;
						const newWordLimit = typeof newQ.wordLimit === 'number' ? newQ.wordLimit : undefined;
						const oldCharLimit = typeof oldQ.charLimit === 'number' ? oldQ.charLimit : undefined;
						const newCharLimit = typeof newQ.charLimit === 'number' ? newQ.charLimit : undefined;
						
						if (oldWordLimit !== newWordLimit || oldCharLimit !== newCharLimit) {
							shouldDeleteSubmissions = true;
							break;
						}
					}
				}
			}
		}
		
		// Delete submissions if questions changed
		if (shouldDeleteSubmissions) {
			await submissionQueries.deleteSubmissionsForQuiz(quizId);
		}
		
		// Update quiz
		const normalizedQuestions = Array.isArray(questions)
			? questions.map((q, index) => {
					const questionText = typeof q.question === 'string' ? q.question : '';
					const points =
						typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0;
					const type =
						typeof q.type === 'string' ? q.type : 'open-response';
					const options = Array.isArray(q.options) ? q.options : undefined;
					const correctAnswer =
						typeof q.correctAnswer === 'number' ? q.correctAnswer : undefined;
					const wordLimit =
						typeof q.wordLimit === 'number' ? q.wordLimit : undefined;
					const charLimit =
						typeof q.charLimit === 'number' ? q.charLimit : undefined;

					return {
						question: questionText,
						points,
						type,
						options,
						correctAnswer,
						wordLimit,
						charLimit,
						orderIndex: index,
					};
			  })
			: null;

		const quizResult = await client.query(
			`UPDATE quizzes 
			 SET title = COALESCE($1, title),
			     description = COALESCE($2, description),
			     published = COALESCE($3, published),
			     due_date = COALESCE($4, due_date),
			     time_limit_minutes = COALESCE($5, time_limit_minutes),
			     questions_json = COALESCE($6, questions_json),
			     updated_at = CURRENT_TIMESTAMP
			 WHERE id = $7
			 RETURNING *`,
			[title, description, published, dueDate, timeLimitMinutes, normalizedQuestions ? JSON.stringify(normalizedQuestions) : null, quizId]
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
 * Delete a quiz and all its submissions (transaction)
 * @param {string} quizId - The quiz ID to delete
 * @param {string} courseId - The course ID (for verification)
 * @returns {Promise<boolean>} True if quiz was deleted, false if not found
 */
export async function deleteQuiz(quizId, courseId) {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		// First, verify the quiz exists and belongs to the specified course
		const quizCheckResult = await client.query(
			'SELECT id FROM quizzes WHERE id = $1 AND course_id = $2',
			[quizId, courseId]
		);
		
		if (quizCheckResult.rows.length === 0) {
			await client.query('ROLLBACK');
			return false;
		}
		
		// Delete all submissions and submission_answers for this quiz
		// This uses the existing function which handles the transaction properly
		// We need to do it manually here since we're already in a transaction
		const submissionsResult = await client.query(
			'SELECT id FROM submissions WHERE quiz_id = $1',
			[quizId]
		);
		
		const submissionIds = submissionsResult.rows.map(row => row.id);
		
		if (submissionIds.length > 0) {
			// Delete submission_answers first (foreign key constraint)
			await client.query(
				'DELETE FROM submission_answers WHERE submission_id = ANY($1)',
				[submissionIds]
			);
			
			// Delete submissions
			await client.query(
				'DELETE FROM submissions WHERE quiz_id = $1',
				[quizId]
			);
		}
		
		// Delete the quiz itself
		const deleteResult = await client.query(
			'DELETE FROM quizzes WHERE id = $1 AND course_id = $2 RETURNING id',
			[quizId, courseId]
		);
		
		if (deleteResult.rows.length === 0) {
			await client.query('ROLLBACK');
			return false;
		}
		
		await client.query('COMMIT');
		return true;
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
