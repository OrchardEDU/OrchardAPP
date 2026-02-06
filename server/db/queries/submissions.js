import { pool } from '../connection.js';

/**
 * Get all submissions for a quiz
 */
export async function getQuizSubmissions(quizId) {
	const result = await pool.query(
		`SELECT 
			s.id, s.quiz_id, s.student_id, s.score, s.max_score, s.submitted_at,
			u.name as student_name, u.email as student_email
		FROM submissions s
		JOIN users u ON s.student_id = u.id
		WHERE s.quiz_id = $1
		ORDER BY s.submitted_at DESC`,
		[quizId]
	);
	
	const submissions = result.rows;
	
	// Get answers for each submission
	for (const submission of submissions) {
		const answersResult = await pool.query(
			`SELECT 
				sa.question_index, sa.answer, sa.points_awarded
			FROM submission_answers sa
			WHERE sa.submission_id = $1
			ORDER BY sa.question_index ASC`,
			[submission.id]
		);
		submission.answers = answersResult.rows.map(row => ({
			question_index: row.question_index,
			answer: row.answer,
			points_awarded: parseFloat(row.points_awarded) || 0,
		}));
	}
	
	return submissions;
}

/**
 * Create or overwrite submission with answers (transaction)
 */
export async function createSubmission(quizId, studentId, answers) {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		// Load quiz questions from JSONB
		const quizResult = await client.query(
			'SELECT questions_json FROM quizzes WHERE id = $1',
			[quizId]
		);

		if (quizResult.rows.length === 0) {
			throw new Error('Quiz not found when creating submission');
		}

		const rawQuestions = Array.isArray(quizResult.rows[0].questions_json)
			? quizResult.rows[0].questions_json
			: [];

		let maxScore = 0;
		rawQuestions.forEach(q => {
			const pts = typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0;
			maxScore += pts;
		});

		// For now we don't auto-grade; score is 0 until manual grading exists
		const totalScore = 0;

		// Upsert submission: if one exists, overwrite it
		const existingResult = await client.query(
			`SELECT id FROM submissions WHERE quiz_id = $1 AND student_id = $2`,
			[quizId, studentId]
		);

		let submission;

		if (existingResult.rows.length > 0) {
			// Update existing submission
			const submissionId = existingResult.rows[0].id;
			const updateResult = await client.query(
				`UPDATE submissions
				 SET score = $1,
				     max_score = $2,
				     submitted_at = CURRENT_TIMESTAMP
				 WHERE id = $3
				 RETURNING *`,
				[totalScore, maxScore, submissionId]
			);
			submission = updateResult.rows[0];

			// Replace existing answers
			await client.query(
				'DELETE FROM submission_answers WHERE submission_id = $1',
				[submissionId]
			);
		} else {
			// Create new submission
			const submissionResult = await client.query(
				`INSERT INTO submissions (quiz_id, student_id, score, max_score)
				 VALUES ($1, $2, $3, $4)
				 RETURNING *`,
				[quizId, studentId, totalScore, maxScore]
			);
			submission = submissionResult.rows[0];
		}

		// Normalize provided answers into indexed list aligned with questions
		const indexedAnswers = Array.isArray(answers) ? answers : [];

		for (let i = 0; i < rawQuestions.length; i++) {
			const match = indexedAnswers.find(a => a.questionIndex === i);
			const answerText = match && typeof match.answer === 'string' ? match.answer : '';

			await client.query(
				`INSERT INTO submission_answers (submission_id, question_index, answer, points_awarded)
				 VALUES ($1, $2, $3, $4)`,
				[submission.id, i, answerText, 0]
			);
		}
		
		await client.query('COMMIT');
		
		// Fetch complete submission with answers
		const completeSubmission = await getSubmissionById(submission.id);
		return completeSubmission;
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(submissionId) {
	const result = await pool.query(
		`SELECT 
			s.id, s.quiz_id, s.student_id, s.score, s.max_score, s.submitted_at,
			u.name as student_name, u.email as student_email
		FROM submissions s
		JOIN users u ON s.student_id = u.id
		WHERE s.id = $1`,
		[submissionId]
	);
	
	if (result.rows.length === 0) {
		return null;
	}
	
	const submission = result.rows[0];
	
	// Get answers
	const answersResult = await pool.query(
		`SELECT 
			sa.question_index, sa.answer, sa.points_awarded
		FROM submission_answers sa
		WHERE sa.submission_id = $1
		ORDER BY sa.question_index ASC`,
		[submission.id]
	);
	
	submission.answers = answersResult.rows.map(row => ({
		question_index: row.question_index,
		answer: row.answer,
		points_awarded: parseFloat(row.points_awarded) || 0,
	}));
	
	return submission;
}
