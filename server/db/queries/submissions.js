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
				sa.question_id, sa.answer, sa.is_correct, sa.points
			FROM submission_answers sa
			WHERE sa.submission_id = $1`,
			[submission.id]
		);
		submission.answers = answersResult.rows;
	}
	
	return submissions;
}

/**
 * Create submission with answers (transaction)
 */
export async function createSubmission(quizId, studentId, answers) {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		// Get quiz questions for grading
		const questionsResult = await client.query(
			'SELECT id, type, correct_answer, points FROM questions WHERE quiz_id = $1',
			[quizId]
		);
		const questions = questionsResult.rows;
		
		let totalScore = 0;
		let maxScore = 0;
		const submissionAnswers = [];
		
		// Grade answers
		for (const question of questions) {
			maxScore += parseFloat(question.points);
			const answer = answers.find(a => a.questionId === question.id);
			
			if (!answer) {
				// No answer provided
				submissionAnswers.push({
					questionId: question.id,
					answer: '',
					isCorrect: false,
					points: 0
				});
				continue;
			}
			
			let isCorrect = false;
			let points = 0;
			
			if (question.type === 'multiple-choice') {
				// Auto-grade multiple choice
				isCorrect = answer.answer === question.correct_answer;
				points = isCorrect ? parseFloat(question.points) : 0;
				totalScore += points;
			} else {
				// Open-ended: no auto-grading, give 0 points initially
				points = 0;
			}
			
			submissionAnswers.push({
				questionId: question.id,
				answer: answer.answer,
				isCorrect: isCorrect,
				points: points
			});
		}
		
		// Create submission
		const submissionResult = await client.query(
			`INSERT INTO submissions (quiz_id, student_id, score, max_score)
			 VALUES ($1, $2, $3, $4)
			 RETURNING *`,
			[quizId, studentId, totalScore, maxScore]
		);
		
		const submission = submissionResult.rows[0];
		
		// Create submission answers
		for (const sa of submissionAnswers) {
			await client.query(
				`INSERT INTO submission_answers (submission_id, question_id, answer, is_correct, points)
				 VALUES ($1, $2, $3, $4, $5)`,
				[submission.id, sa.questionId, sa.answer, sa.isCorrect, sa.points]
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
			sa.question_id, sa.answer, sa.is_correct, sa.points
		FROM submission_answers sa
		WHERE sa.submission_id = $1`,
		[submission.id]
	);
	
	submission.answers = answersResult.rows;
	
	return submission;
}
