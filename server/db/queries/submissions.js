import { pool } from '../connection.js';

/**
 * Get all submissions for a quiz
 */
export async function getQuizSubmissions(quizId) {
	const result = await pool.query(
		`SELECT 
			s.id, s.quiz_id, s.student_id, s.score, s.max_score, s.is_graded, s.submitted_at,
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
		
		// We'll compute totalScore after inserting answers (auto-grading multiple choice)
		let totalScore = 0;

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
			const question = rawQuestions[i] || {};
			const match = indexedAnswers.find(a => a.questionIndex === i);
			const answerText = match && typeof match.answer === 'string' ? match.answer : '';

			const type = typeof question.type === 'string' ? question.type : 'open-response';
			const pts = typeof question.points === 'number' ? question.points : parseInt(question.points, 10) || 0;

			let pointsAwarded = 0;
			if (type === 'multiple-choice') {
				const correctIndex =
					typeof question.correctAnswer === 'number' ? question.correctAnswer : 0;
				const selectedIndex = answerText !== '' ? parseInt(answerText, 10) : NaN;
				if (!Number.isNaN(selectedIndex) && selectedIndex === correctIndex) {
					pointsAwarded = pts;
				} else {
					pointsAwarded = 0;
				}
			}

			totalScore += pointsAwarded;

			await client.query(
				`INSERT INTO submission_answers (submission_id, question_index, answer, points_awarded)
				 VALUES ($1, $2, $3, $4)`,
				[submission.id, i, answerText, pointsAwarded]
			);
		}

		// Update submission score, but leave is_graded = false for teacher review/override
		await client.query(
			`UPDATE submissions
			 SET score = $1,
			     max_score = $2
			 WHERE id = $3`,
			[totalScore, maxScore, submission.id]
		);
		
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
 * Delete all submissions and submission_answers for a quiz
 */
export async function deleteSubmissionsForQuiz(quizId) {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		// Get all submission IDs for this quiz
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
		
		await client.query('COMMIT');
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

/**
 * Get submission by ID with quiz questions
 */
export async function getSubmissionById(submissionId) {
	const result = await pool.query(
		`SELECT 
			s.id, s.quiz_id, s.student_id, s.score, s.max_score, s.is_graded, s.submitted_at,
			u.name as student_name, u.email as student_email,
			q.questions_json, q.title as quiz_title
		FROM submissions s
		JOIN users u ON s.student_id = u.id
		JOIN quizzes q ON s.quiz_id = q.id
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
	
	// Include quiz questions
	if (submission.questions_json) {
		const rawQuestions = Array.isArray(submission.questions_json) 
			? submission.questions_json 
			: [];
		submission.quiz_questions = rawQuestions.map((q, index) => ({
			question: typeof q.question === 'string' ? q.question : '',
			points: typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0,
			type: typeof q.type === 'string' ? q.type : 'open-response',
			options: Array.isArray(q.options) ? q.options : undefined,
			correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : undefined,
			wordLimit: typeof q.wordLimit === 'number' ? q.wordLimit : undefined,
			charLimit: typeof q.charLimit === 'number' ? q.charLimit : undefined,
			orderIndex: typeof q.orderIndex === 'number' ? q.orderIndex : index,
		}));
	}
	
	return submission;
}

/**
 * Grade a submission by updating points_awarded and score
 */
export async function gradeSubmission(submissionId, gradedAnswers) {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		// Get submission and quiz to validate
		const submissionResult = await client.query(
			`SELECT s.*, q.questions_json 
			 FROM submissions s
			 JOIN quizzes q ON s.quiz_id = q.id
			 WHERE s.id = $1`,
			[submissionId]
		);
		
		if (submissionResult.rows.length === 0) {
			throw new Error('Submission not found');
		}
		
		const submission = submissionResult.rows[0];
		const rawQuestions = Array.isArray(submission.questions_json) 
			? submission.questions_json 
			: [];
		
		// Calculate max_score from questions
		let maxScore = 0;
		rawQuestions.forEach(q => {
			const pts = typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0;
			maxScore += pts;
		});
		
		// Update points_awarded for each answer
		let totalScore = 0;
		for (const gradedAnswer of gradedAnswers) {
			const questionIndex = gradedAnswer.questionIndex;
			const pointsAwarded = gradedAnswer.pointsAwarded || 0;
			
			// Validate points don't exceed question max
			if (questionIndex >= 0 && questionIndex < rawQuestions.length) {
				const question = rawQuestions[questionIndex];
				const maxPoints = typeof question.points === 'number' 
					? question.points 
					: parseInt(question.points, 10) || 0;
				
				if (pointsAwarded < 0 || pointsAwarded > maxPoints) {
					throw new Error(`Points awarded (${pointsAwarded}) must be between 0 and ${maxPoints} for question ${questionIndex}`);
				}
				
				totalScore += pointsAwarded;
			}
			
			// Update or insert points_awarded
			await client.query(
				`UPDATE submission_answers
				 SET points_awarded = $1
				 WHERE submission_id = $2 AND question_index = $3`,
				[pointsAwarded, submissionId, questionIndex]
			);
		}
		
		// Update submission score and mark as graded
		await client.query(
			`UPDATE submissions
			 SET score = $1,
			     max_score = $2,
			     is_graded = TRUE
			 WHERE id = $3`,
			[totalScore, maxScore, submissionId]
		);
		
		await client.query('COMMIT');
		
		// Return updated submission
		return await getSubmissionById(submissionId);
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

/**
 * Get student's own submission for a quiz (with visibility control)
 */
export async function getStudentSubmission(quizId, studentId) {
	const result = await pool.query(
		`SELECT 
			s.id, s.quiz_id, s.student_id, s.score, s.max_score, s.is_graded, s.submitted_at
		FROM submissions s
		WHERE s.quiz_id = $1 AND s.student_id = $2`,
		[quizId, studentId]
	);
	
	if (result.rows.length === 0) {
		return null;
	}
	
	const submission = result.rows[0];
	
	// Only return submission if it's graded
	if (!submission.is_graded) {
		return null;
	}
	
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
	
	// Get quiz questions
	const quizResult = await pool.query(
		'SELECT questions_json, title FROM quizzes WHERE id = $1',
		[quizId]
	);
	
	if (quizResult.rows.length > 0) {
		const rawQuestions = Array.isArray(quizResult.rows[0].questions_json) 
			? quizResult.rows[0].questions_json 
			: [];
		submission.quiz_questions = rawQuestions.map((q, index) => ({
			question: typeof q.question === 'string' ? q.question : '',
			points: typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0,
			type: typeof q.type === 'string' ? q.type : 'open-response',
			options: Array.isArray(q.options) ? q.options : undefined,
			correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : undefined,
			wordLimit: typeof q.wordLimit === 'number' ? q.wordLimit : undefined,
			charLimit: typeof q.charLimit === 'number' ? q.charLimit : undefined,
			orderIndex: typeof q.orderIndex === 'number' ? q.orderIndex : index,
		}));
		submission.quiz_title = quizResult.rows[0].title;
	}
	
	return submission;
}
