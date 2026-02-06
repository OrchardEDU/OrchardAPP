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
			dueDate: quiz.due_date ? quiz.due_date.toISOString() : null,
			questions: Array.isArray(quiz.questions)
				? quiz.questions.map(q => ({
						question: q.question,
						points: q.points,
				  }))
				: [],
			createdAt: quiz.created_at.toISOString(),
			questionCount: parseInt(quiz.question_count) || 0,
			...(role === 'teacher' && { submissionCount: parseInt(quiz.submission_count) || 0 }),
			...(role === 'student' && { hasSubmission: quiz.has_submission || false }),
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
			dueDate: quiz.due_date ? quiz.due_date.toISOString() : null,
			questions: (quiz.questions || []).map(q => ({
				question: q.question,
				points: parseInt(q.points, 10) || 0,
			})),
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
		const { title, description, published, dueDate, questions } = req.body;

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

		// Validate questions if provided (simple open-ended questions: text + points)
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
			}
		}

		const quiz = await quizQueries.createQuiz(
			courseId,
			title.trim(),
			description?.trim() || '',
			published || false,
			dueDate || null,
			questions || []
		);

		// Format quiz to match frontend expectations
		const formattedQuiz = {
			id: quiz.id,
			courseId: quiz.course_id,
			title: quiz.title,
			description: quiz.description || '',
			published: quiz.published,
			dueDate: quiz.due_date ? quiz.due_date.toISOString() : null,
			questions: (quiz.questions || []).map(q => ({
				question: q.question,
				points: parseInt(q.points, 10) || 0,
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
		const { title, description, published, dueDate, questions } = req.body;

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

		// Validate questions if provided (simple open-ended questions: text + points)
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
			}
		}

		const quiz = await quizQueries.updateQuiz(
			quizId,
			title?.trim(),
			description?.trim(),
			published,
			dueDate || null,
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
			dueDate: quiz.due_date ? quiz.due_date.toISOString() : null,
			questions: (quiz.questions || []).map(q => ({
				question: q.question,
				points: parseInt(q.points, 10) || 0,
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
			submittedAt: submission.submitted_at.toISOString(),
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

export default router;
