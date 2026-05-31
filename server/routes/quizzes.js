import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { isValidUUID } from '../utils/validation.js';
import * as courseQueries from '../db/queries/courses.js';
import * as quizQueries from '../db/queries/quizzes.js';
import * as submissionQueries from '../db/queries/submissions.js';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(requireAuth);

/**
 * Helper function to format a question with all type fields
 */
function formatQuestion(q) {
	return {
		question: q.question || '',
		points: typeof q.points === 'number' ? q.points : parseInt(q.points, 10) || 0,
		type: q.type || 'open-response',
		options: Array.isArray(q.options) ? q.options : undefined,
		correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : undefined,
		wordLimit: typeof q.wordLimit === 'number' ? q.wordLimit : undefined,
		charLimit: typeof q.charLimit === 'number' ? q.charLimit : undefined,
		orderIndex: typeof q.orderIndex === 'number' ? q.orderIndex : undefined,
	};
}

/**
 * Middleware to validate course access
 */
const validateCourseAccess = async (req, res, next) => {
	try {
		const { courseId } = req.params;
		const userId = req.session.userId;
		const role = req.session.role;

		if (!isValidUUID(courseId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid course ID',
			});
		}

		// Check access (owner or enrolled)
		const isOwner = await courseQueries.isCourseOwner(userId, courseId);
		const isEnrolled = role === 'student' ? await courseQueries.isEnrolled(userId, courseId) : false;

		if (!isOwner && !isEnrolled) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		req.courseAccess = { isOwner, isEnrolled };
		next();
	} catch (error) {
		console.error('Course access validation error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

/**
 * GET /api/courses/:courseId/quizzes
 * Get all quizzes for a course
 */
router.get('/:courseId/quizzes', validateCourseAccess, async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.session.userId;
		const role = req.session.role;

		const quizzes = await quizQueries.getQuizzesForCourse(courseId, userId, role);

		// Format quizzes to match frontend expectations
		const formattedQuizzes = quizzes.map(quiz => ({
			id: quiz.id,
			courseId: quiz.course_id,
			title: quiz.title,
			description: quiz.description || '',
			published: quiz.published,
			timeLimitMinutes:
				typeof quiz.time_limit_minutes === 'number'
					? quiz.time_limit_minutes
					: quiz.time_limit_minutes
					? parseInt(quiz.time_limit_minutes, 10) || null
					: null,
			dueDate: quiz.due_date ? quiz.due_date.toISOString() : null,
			questions: Array.isArray(quiz.questions_json)
				? quiz.questions_json.map(q => formatQuestion(q))
				: [],
			createdAt: quiz.created_at.toISOString(),
			questionCount: parseInt(quiz.question_count) || 0,
			...(role === 'teacher' && { submissionCount: parseInt(quiz.submission_count) || 0 }),
			...(role === 'student' && { 
				hasSubmission: quiz.has_submission || false,
				...(quiz.is_graded && {
					score: parseFloat(quiz.score) || 0,
					maxScore: parseFloat(quiz.max_score) || 0,
					isGraded: quiz.is_graded || false,
				}),
			}),
		}));

		res.json({
			success: true,
			data: {
				quizzes: formattedQuizzes,
			},
		});
	} catch (error) {
		console.error('Get quizzes error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * GET /api/courses/:courseId/quizzes/:quizId
 * Get a specific quiz with questions
 */
router.get('/:courseId/quizzes/:quizId', validateCourseAccess, async (req, res) => {
	try {
		const { quizId } = req.params;
		const userId = req.session.userId;
		const role = req.session.role;

		if (!isValidUUID(quizId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid quiz ID',
			});
		}

		const quiz = await quizQueries.getQuizById(quizId, userId, role);

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}

		// Format quiz to match frontend expectations
		const formattedQuiz = {
			id: quiz.id,
			courseId: quiz.course_id,
			title: quiz.title,
			description: quiz.description || '',
			published: quiz.published,
			timeLimitMinutes:
				typeof quiz.time_limit_minutes === 'number'
					? quiz.time_limit_minutes
					: quiz.time_limit_minutes
					? parseInt(quiz.time_limit_minutes, 10) || null
					: null,
			dueDate: quiz.due_date ? quiz.due_date.toISOString() : null,
			questions: (quiz.questions || []).map(q => formatQuestion(q)),
			createdAt: quiz.created_at.toISOString(),
			...(quiz.hasSubmission !== undefined && { hasSubmission: quiz.hasSubmission }),
		};

		res.json({
			success: true,
			data: {
				quiz: formattedQuiz,
			},
		});
	} catch (error) {
		console.error('Get quiz error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * POST /api/courses/:courseId/quizzes
 * Create a new quiz (teachers only)
 */
router.post('/:courseId/quizzes', validateCourseAccess, requireRole('teacher'), async (req, res) => {
	try {
		const { courseId } = req.params;
		const { title, description, published, dueDate, timeLimitMinutes, questions } = req.body;

		// Check ownership
		if (!req.courseAccess.isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		if (!title || typeof title !== 'string' || title.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Quiz title is required',
			});
		}

		if (
			timeLimitMinutes !== undefined &&
			timeLimitMinutes !== null &&
			(typeof timeLimitMinutes !== 'number' || !Number.isInteger(timeLimitMinutes) || timeLimitMinutes <= 0)
		) {
			return res.status(400).json({
				success: false,
				message: 'timeLimitMinutes must be a positive integer when provided',
			});
		}

		// Validate questions if provided
		if (questions && Array.isArray(questions)) {
			for (const q of questions) {
				if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
					return res.status(400).json({
						success: false,
						message: 'Question text is required',
					});
				}
				if (q.points === undefined || typeof q.points !== 'number' || q.points < 1) {
					return res.status(400).json({
						success: false,
						message: 'Points must be a number greater than or equal to 1',
					});
				}

				const type = typeof q.type === 'string' ? q.type : 'open-response';

				if (type === 'multiple-choice') {
					if (!Array.isArray(q.options) || q.options.length < 2) {
						return res.status(400).json({
							success: false,
							message: 'Multiple choice questions must have at least two options',
						});
					}
					const correctIndex = q.correctAnswer ?? 0;
					if (
						typeof correctIndex !== 'number' ||
						correctIndex < 0 ||
						correctIndex >= q.options.length
					) {
						return res.status(400).json({
							success: false,
							message: 'Multiple choice questions must have a valid correctAnswer index',
						});
					}
				}

				if (type === 'short-answer') {
					if (q.wordLimit !== undefined && (typeof q.wordLimit !== 'number' || q.wordLimit < 1)) {
						return res.status(400).json({
							success: false,
							message: 'Short answer wordLimit must be a positive number when provided',
						});
					}
					if (q.charLimit !== undefined && (typeof q.charLimit !== 'number' || q.charLimit < 1)) {
						return res.status(400).json({
							success: false,
							message: 'Short answer charLimit must be a positive number when provided',
						});
					}
				}
			}
		}

		const quiz = await quizQueries.createQuiz(
			courseId,
			title.trim(),
			description?.trim() || '',
			published || false,
			dueDate || null,
			timeLimitMinutes ?? null,
			questions || []
		);

		// Format quiz to match frontend expectations
		const formattedQuiz = {
			id: quiz.id,
			courseId: quiz.course_id,
			title: quiz.title,
			description: quiz.description || '',
			published: quiz.published,
			timeLimitMinutes:
				typeof quiz.time_limit_minutes === 'number'
					? quiz.time_limit_minutes
					: quiz.time_limit_minutes
					? parseInt(quiz.time_limit_minutes, 10) || null
					: null,
			dueDate: quiz.due_date ? quiz.due_date.toISOString() : null,
			questions: (quiz.questions || []).map(q => formatQuestion(q)),
			createdAt: quiz.created_at.toISOString(),
		};

		res.json({
			success: true,
			data: {
				quiz: formattedQuiz,
			},
		});
	} catch (error) {
		console.error('Create quiz error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * PUT /api/courses/:courseId/quizzes/:quizId
 * Update a quiz (teachers only)
 */
router.put('/:courseId/quizzes/:quizId', validateCourseAccess, requireRole('teacher'), async (req, res) => {
	try {
		const { quizId } = req.params;
		const { title, description, published, dueDate, timeLimitMinutes, questions } = req.body;

		// Check ownership
		if (!req.courseAccess.isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		if (!isValidUUID(quizId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid quiz ID',
			});
		}

		// Check if quiz exists
		const existingQuiz = await quizQueries.getQuizById(quizId, null, 'teacher');
		if (!existingQuiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}

		// If quiz is published, only allow changing the published status (unpublishing)
		// Prevent editing questions, title, description, or dueDate
		if (existingQuiz.published) {
			// Check if any fields other than published are present in the request body
			const requestKeys = Object.keys(req.body);
			const hasOtherChanges = requestKeys.some(key => 
				key !== 'published' && 
				(key === 'title' || key === 'description' || key === 'dueDate' || key === 'timeLimitMinutes' || key === 'questions')
			);
			
			// If there are other changes, block them (even if also unpublishing)
			if (hasOtherChanges) {
				console.error(`Attempted to edit published quiz ${quizId}. Only unpublishing is allowed.`, {
					requestKeys,
					hasOtherChanges,
					published,
				});
				return res.status(400).json({
					success: false,
					message: 'Cannot edit a published quiz. You can only unpublish it.',
				});
			}
			// If only published status is being changed, allow it (unpublishing)
		}

		if (
			timeLimitMinutes !== undefined &&
			timeLimitMinutes !== null &&
			(typeof timeLimitMinutes !== 'number' || !Number.isInteger(timeLimitMinutes) || timeLimitMinutes <= 0)
		) {
			return res.status(400).json({
				success: false,
				message: 'timeLimitMinutes must be a positive integer when provided',
			});
		}

		// Validate questions if provided
		if (questions && Array.isArray(questions)) {
			for (const q of questions) {
				if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
					return res.status(400).json({
						success: false,
						message: 'Question text is required',
					});
				}
				if (q.points === undefined || typeof q.points !== 'number' || q.points < 1) {
					return res.status(400).json({
						success: false,
						message: 'Points must be a number greater than or equal to 1',
					});
				}

				const type = typeof q.type === 'string' ? q.type : 'open-response';

				if (type === 'multiple-choice') {
					if (!Array.isArray(q.options) || q.options.length < 2) {
						return res.status(400).json({
							success: false,
							message: 'Multiple choice questions must have at least two options',
						});
					}
					const correctIndex = q.correctAnswer ?? 0;
					if (
						typeof correctIndex !== 'number' ||
						correctIndex < 0 ||
						correctIndex >= q.options.length
					) {
						return res.status(400).json({
							success: false,
							message: 'Multiple choice questions must have a valid correctAnswer index',
						});
					}
				}

				if (type === 'short-answer') {
					if (q.wordLimit !== undefined && (typeof q.wordLimit !== 'number' || q.wordLimit < 1)) {
						return res.status(400).json({
							success: false,
							message: 'Short answer wordLimit must be a positive number when provided',
						});
					}
					if (q.charLimit !== undefined && (typeof q.charLimit !== 'number' || q.charLimit < 1)) {
						return res.status(400).json({
							success: false,
							message: 'Short answer charLimit must be a positive number when provided',
						});
					}
				}
			}
		}

		const quiz = await quizQueries.updateQuiz(
			quizId,
			title?.trim(),
			description?.trim(),
			published,
			dueDate || null,
			timeLimitMinutes ?? null,
			questions
		);

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}

		// Format quiz to match frontend expectations
		const formattedQuiz = {
			id: quiz.id,
			courseId: quiz.course_id,
			title: quiz.title,
			description: quiz.description || '',
			published: quiz.published,
			timeLimitMinutes:
				typeof quiz.time_limit_minutes === 'number'
					? quiz.time_limit_minutes
					: quiz.time_limit_minutes
					? parseInt(quiz.time_limit_minutes, 10) || null
					: null,
			dueDate: quiz.due_date ? quiz.due_date.toISOString() : null,
			questions: (quiz.questions || []).map(q => ({
				question: q.question,
				points: parseInt(q.points, 10) || 0,
				type: q.type || 'open-response',
				options: Array.isArray(q.options) ? q.options : undefined,
				correctAnswer:
					typeof q.correctAnswer === 'number' ? q.correctAnswer : undefined,
				wordLimit:
					typeof q.wordLimit === 'number' ? q.wordLimit : undefined,
				charLimit:
					typeof q.charLimit === 'number' ? q.charLimit : undefined,
				orderIndex:
					typeof q.orderIndex === 'number' ? q.orderIndex : undefined,
			})),
			createdAt: quiz.created_at.toISOString(),
		};

		res.json({
			success: true,
			data: {
				quiz: formattedQuiz,
			},
		});
	} catch (error) {
		console.error('Update quiz error:', error);
		// If it's a known error (like "Cannot edit a published quiz"), return 400 with the message
		if (error.message && error.message.includes('Cannot edit')) {
			return res.status(400).json({
				success: false,
				message: error.message,
			});
		}
		// Otherwise return 500 for unexpected errors
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * DELETE /api/courses/:courseId/quizzes/:quizId
 * Delete a quiz (teachers only, course owners only)
 */
router.delete('/:courseId/quizzes/:quizId', validateCourseAccess, requireRole('teacher'), async (req, res) => {
	try {
		const { courseId, quizId } = req.params;

		// Check ownership - only course owners can delete quizzes
		if (!req.courseAccess.isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied. Only course owners can delete quizzes.',
			});
		}

		// Validate UUIDs
		if (!isValidUUID(courseId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid course ID',
			});
		}

		if (!isValidUUID(quizId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid quiz ID',
			});
		}

		// Verify quiz exists and belongs to the course
		const existingQuiz = await quizQueries.getQuizById(quizId, null, 'teacher');
		if (!existingQuiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}

		// Double-check that the quiz belongs to the specified course
		if (existingQuiz.course_id !== courseId) {
			return res.status(403).json({
				success: false,
				message: 'Quiz does not belong to this course',
			});
		}

		// Delete the quiz (this also deletes all related submissions)
		const deleted = await quizQueries.deleteQuiz(quizId, courseId);
		
		if (!deleted) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found or could not be deleted',
			});
		}

		res.json({
			success: true,
			message: 'Quiz deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting quiz:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * POST /api/courses/:courseId/quizzes/:quizId/start
 * Start quiz timer for a student (students only)
 */
router.post('/:courseId/quizzes/:quizId/start', validateCourseAccess, requireRole('student'), async (req, res) => {
	try {
		const { quizId } = req.params;
		const studentId = req.session.userId;

		if (!req.courseAccess.isEnrolled) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		if (!isValidUUID(quizId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid quiz ID',
			});
		}

		const quiz = await quizQueries.getQuizById(quizId, studentId, 'student');
		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}

		const timeLimitMinutes =
			typeof quiz.time_limit_minutes === 'number'
				? quiz.time_limit_minutes
				: quiz.time_limit_minutes
				? parseInt(quiz.time_limit_minutes, 10) || null
				: null;

		if (!timeLimitMinutes) {
			return res.json({
				success: true,
				data: {
					startedAt: null,
					expiresAt: null,
					timeLimitMinutes: null,
				},
			});
		}

		const attempt = await submissionQueries.startQuizAttempt(quizId, studentId);

		const startedAt = attempt?.started_at ? new Date(attempt.started_at) : null;
		const expiresAt =
			startedAt && timeLimitMinutes
				? new Date(startedAt.getTime() + timeLimitMinutes * 60 * 1000)
				: null;

		res.json({
			success: true,
			data: {
				startedAt: startedAt ? startedAt.toISOString() : null,
				expiresAt: expiresAt ? expiresAt.toISOString() : null,
				timeLimitMinutes,
			},
		});
	} catch (error) {
		console.error('Start quiz error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * GET /api/courses/:courseId/quizzes/:quizId/submissions
 * Get all submissions for a quiz (teachers only)
 */
router.get('/:courseId/quizzes/:quizId/submissions', validateCourseAccess, requireRole('teacher'), async (req, res) => {
	try {
		const { quizId } = req.params;

		// Check ownership
		if (!req.courseAccess.isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		if (!isValidUUID(quizId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid quiz ID',
			});
		}

		const submissions = await submissionQueries.getQuizSubmissions(quizId);

		// Format submissions to match frontend expectations
		const formattedSubmissions = submissions.map(submission => ({
			id: submission.id,
			quizId: submission.quiz_id,
			studentId: submission.student_id,
			studentName: submission.student_name,
			studentEmail: submission.student_email,
			answers: (submission.answers || []).map(a => ({
				questionIndex: a.question_index,
				answer: a.answer,
				pointsAwarded: parseFloat(a.points_awarded) || 0,
			})),
			score: parseFloat(submission.score) || 0,
			maxScore: parseFloat(submission.max_score) || 0,
			isGraded: submission.is_graded || false,
			submittedAt: submission.submitted_at.toISOString(),
		}));

		res.json({
			success: true,
			data: {
				submissions: formattedSubmissions,
			},
		});
	} catch (error) {
		console.error('Get submissions error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * POST /api/courses/:courseId/quizzes/:quizId/submit
 * Submit a quiz (students only)
 */
router.post('/:courseId/quizzes/:quizId/submit', validateCourseAccess, requireRole('student'), async (req, res) => {
	try {
		const { quizId } = req.params;
		const { answers } = req.body;
		const studentId = req.session.userId;

		// Check enrollment
		if (!req.courseAccess.isEnrolled) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		if (!isValidUUID(quizId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid quiz ID',
			});
		}

		if (!answers || !Array.isArray(answers)) {
			return res.status(400).json({
				success: false,
				message: 'Answers are required',
			});
		}

		// Validate answers format: questionIndex (number) + answer (string)
		for (const answer of answers) {
			if (typeof answer.questionIndex !== 'number' || answer.questionIndex < 0) {
				return res.status(400).json({
					success: false,
					message: 'Each answer must include a non-negative questionIndex number',
				});
			}
			if (typeof answer.answer !== 'string') {
				return res.status(400).json({
					success: false,
					message: 'Answer must be a string',
				});
			}
		}

		// Check if quiz can be submitted
		const canSubmit = await quizQueries.canSubmitQuiz(quizId, studentId);
		if (!canSubmit.canSubmit) {
			return res.status(400).json({
				success: false,
				message: canSubmit.reason,
			});
		}

		// Enforce quiz time limit when present
		const quiz = await quizQueries.getQuizById(quizId, studentId, 'student');
		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: 'Quiz not found',
			});
		}
		const timeLimitMinutes =
			typeof quiz.time_limit_minutes === 'number'
				? quiz.time_limit_minutes
				: quiz.time_limit_minutes
				? parseInt(quiz.time_limit_minutes, 10) || null
				: null;

		if (timeLimitMinutes) {
			const attempt = await submissionQueries.getQuizAttempt(quizId, studentId);
			if (!attempt || !attempt.started_at) {
				return res.status(400).json({
					success: false,
					message: 'Quiz timer has not started for this attempt',
				});
			}

			const startedAt = new Date(attempt.started_at);
			const deadline = new Date(startedAt.getTime() + timeLimitMinutes * 60 * 1000);
			if (new Date() > deadline) {
				return res.status(400).json({
					success: false,
					message: 'Submission denied: time limit has expired',
				});
			}
		}

		// Create or overwrite submission
		const submission = await submissionQueries.createSubmission(quizId, studentId, answers);

		// Format submission to match frontend expectations
		const formattedSubmission = {
			id: submission.id,
			quizId: submission.quiz_id,
			studentId: submission.student_id,
			studentName: submission.student_name,
			studentEmail: submission.student_email,
			answers: (submission.answers || []).map(a => ({
				questionIndex: a.question_index,
				answer: a.answer,
				pointsAwarded: parseFloat(a.points_awarded) || 0,
			})),
			score: parseFloat(submission.score) || 0,
			maxScore: parseFloat(submission.max_score) || 0,
			isGraded: submission.is_graded || false,
			submittedAt: submission.submitted_at.toISOString(),
			quizTitle: submission.quiz_title,
			quizQuestions: (submission.quiz_questions || []).map(q => formatQuestion(q)),
		};

		res.json({
			success: true,
			data: {
				submission: formattedSubmission,
			},
		});
	} catch (error) {
		console.error('Submit quiz error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * GET /api/courses/:courseId/quizzes/:quizId/submissions/:submissionId
 * Get detailed submission with quiz questions (teachers only)
 */
router.get('/:courseId/quizzes/:quizId/submissions/:submissionId', validateCourseAccess, requireRole('teacher'), async (req, res) => {
	try {
		const { submissionId } = req.params;

		// Check ownership
		if (!req.courseAccess.isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		if (!isValidUUID(submissionId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid submission ID',
			});
		}

		const submission = await submissionQueries.getSubmissionById(submissionId);

		if (!submission) {
			return res.status(404).json({
				success: false,
				message: 'Submission not found',
			});
		}

		// Format submission to match frontend expectations
		const formattedSubmission = {
			id: submission.id,
			quizId: submission.quiz_id,
			studentId: submission.student_id,
			studentName: submission.student_name,
			studentEmail: submission.student_email,
			answers: (submission.answers || []).map(a => ({
				questionIndex: a.question_index,
				answer: a.answer,
				pointsAwarded: parseFloat(a.points_awarded) || 0,
			})),
			score: parseFloat(submission.score) || 0,
			maxScore: parseFloat(submission.max_score) || 0,
			isGraded: submission.is_graded || false,
			submittedAt: submission.submitted_at.toISOString(),
			quizTitle: submission.quiz_title,
			quizQuestions: (submission.quiz_questions || []).map(q => formatQuestion(q)),
		};

		res.json({
			success: true,
			data: {
				submission: formattedSubmission,
			},
		});
	} catch (error) {
		console.error('Get submission detail error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * POST /api/courses/:courseId/quizzes/:quizId/submissions/:submissionId/grade
 * Grade a submission (teachers only)
 */
router.post('/:courseId/quizzes/:quizId/submissions/:submissionId/grade', validateCourseAccess, requireRole('teacher'), async (req, res) => {
	try {
		const { submissionId } = req.params;
		const { answers } = req.body;

		// Check ownership
		if (!req.courseAccess.isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		if (!isValidUUID(submissionId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid submission ID',
			});
		}

		if (!answers || !Array.isArray(answers)) {
			return res.status(400).json({
				success: false,
				message: 'Answers array is required',
			});
		}

		// Validate answers format
		for (const answer of answers) {
			if (typeof answer.questionIndex !== 'number' || answer.questionIndex < 0) {
				return res.status(400).json({
					success: false,
					message: 'Each answer must include a non-negative questionIndex number',
				});
			}
			if (answer.pointsAwarded === undefined || typeof answer.pointsAwarded !== 'number' || answer.pointsAwarded < 0) {
				return res.status(400).json({
					success: false,
					message: 'Each answer must include a non-negative pointsAwarded number',
				});
			}
		}

		const gradedSubmission = await submissionQueries.gradeSubmission(submissionId, answers);

		if (!gradedSubmission) {
			return res.status(404).json({
				success: false,
				message: 'Submission not found',
			});
		}

		// Format submission to match frontend expectations
		const formattedSubmission = {
			id: gradedSubmission.id,
			quizId: gradedSubmission.quiz_id,
			studentId: gradedSubmission.student_id,
			studentName: gradedSubmission.student_name,
			studentEmail: gradedSubmission.student_email,
			answers: (gradedSubmission.answers || []).map(a => ({
				questionIndex: a.question_index,
				answer: a.answer,
				pointsAwarded: parseFloat(a.points_awarded) || 0,
			})),
			score: parseFloat(gradedSubmission.score) || 0,
			maxScore: parseFloat(gradedSubmission.max_score) || 0,
			isGraded: gradedSubmission.is_graded || false,
			submittedAt: gradedSubmission.submitted_at.toISOString(),
			quizTitle: gradedSubmission.quiz_title,
			quizQuestions: (gradedSubmission.quiz_questions || []).map(q => ({
				question: q.question,
				points: q.points,
				orderIndex: q.orderIndex,
			})),
		};

		res.json({
			success: true,
			data: {
				submission: formattedSubmission,
			},
		});
	} catch (error) {
		console.error('Grade submission error:', error);
		res.status(500).json({
			success: false,
			message: error.message || 'Internal server error',
		});
	}
});

/**
 * GET /api/courses/:courseId/quizzes/:quizId/my-submission
 * Get student's own submission (students only, only if graded)
 */
router.get('/:courseId/quizzes/:quizId/my-submission', validateCourseAccess, requireRole('student'), async (req, res) => {
	try {
		const { quizId } = req.params;
		const studentId = req.session.userId;

		// Check enrollment
		if (!req.courseAccess.isEnrolled) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		if (!isValidUUID(quizId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid quiz ID',
			});
		}

		const submission = await submissionQueries.getStudentSubmission(quizId, studentId);

		// Returns null if not graded (visibility control)
		if (!submission) {
			return res.json({
				success: true,
				data: {
					submission: null,
				},
			});
		}

		// Format submission to match frontend expectations
		const formattedSubmission = {
			id: submission.id,
			quizId: submission.quiz_id,
			studentId: submission.student_id,
			answers: (submission.answers || []).map(a => ({
				questionIndex: a.question_index,
				answer: a.answer,
				pointsAwarded: parseFloat(a.points_awarded) || 0,
			})),
			score: parseFloat(submission.score) || 0,
			maxScore: parseFloat(submission.max_score) || 0,
			isGraded: submission.is_graded || false,
			submittedAt: submission.submitted_at.toISOString(),
			quizTitle: submission.quiz_title,
			quizQuestions: (submission.quiz_questions || []).map(q => formatQuestion(q)),
		};

		res.json({
			success: true,
			data: {
				submission: formattedSubmission,
			},
		});
	} catch (error) {
		console.error('Get my submission error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

export default router;
