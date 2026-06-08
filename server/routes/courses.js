import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { isValidUUID } from '../utils/validation.js';
import * as courseQueries from '../db/queries/courses.js';
import * as userQueries from '../db/queries/users.js';
import * as canvasQueries from '../db/queries/canvas.js';
import {
	formatCourseCanvasLink,
	linkOrchardCourseToCanvas,
} from '../services/canvas/courseLink.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/courses
 * Get all courses for the current user
 */
router.get('/', async (req, res) => {
	try {
		const userId = req.session.userId;
		const role = req.session.role;

		const courses = await courseQueries.getCoursesForUser(userId, role);

		// Format courses to match frontend expectations
		const formattedCourses = courses.map(course => ({
			id: course.id,
			name: course.name,
			description: course.description || '',
			teacherId: course.teacher_id,
			teacherName: course.teacher_name,
			joinCode: course.join_code,
			createdAt: course.created_at.toISOString(),
			...(role === 'student' && { enrolledAt: course.enrolled_at?.toISOString() }),
			...(role === 'teacher' && { studentCount: parseInt(course.student_count) || 0 }),
		}));

		res.json({
			success: true,
			data: {
				courses: formattedCourses,
			},
		});
	} catch (error) {
		console.error('Get courses error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * GET /api/courses/:courseId/students
 * Get enrolled students for a course (owner only)
 */
router.get('/:courseId/students', requireRole('teacher'), async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.session.userId;

		if (!isValidUUID(courseId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid course ID',
			});
		}

		// Check ownership
		const isOwner = await courseQueries.isCourseOwner(userId, courseId);
		if (!isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		// Get enrolled students
		const students = await courseQueries.getEnrolledStudents(courseId);

		// Format students to match frontend expectations
		const formattedStudents = students.map(student => ({
			id: student.id,
			name: student.name,
			email: student.email,
			enrolledAt: student.enrolled_at.toISOString(),
		}));

		res.json({
			success: true,
			data: {
				students: formattedStudents,
			},
		});
	} catch (error) {
		console.error('Get students error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * DELETE /api/courses/:courseId/students/:studentId
 * Remove a student from a course (owner only)
 */
router.delete('/:courseId/students/:studentId', requireRole('teacher'), async (req, res) => {
	try {
		const { courseId, studentId } = req.params;
		const userId = req.session.userId;

		if (!isValidUUID(courseId) || !isValidUUID(studentId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid course ID or student ID',
			});
		}

		// Check ownership
		const isOwner = await courseQueries.isCourseOwner(userId, courseId);
		if (!isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		// Remove student
		const removed = await courseQueries.removeStudent(courseId, studentId);
		if (!removed) {
			return res.status(404).json({
				success: false,
				message: 'Student not found in course',
			});
		}

		res.json({
			success: true,
			data: {
				id: removed.id,
			},
		});
	} catch (error) {
		console.error('Remove student error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * POST /api/courses/:courseId/canvas/link
 * Link an Orchard course to a Canvas course (owner only)
 */
router.post('/:courseId/canvas/link', requireRole('teacher'), async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.session.userId;
		const { canvasCourseId } = req.body;

		if (!isValidUUID(courseId)) {
			return res.status(400).json({ success: false, message: 'Invalid course ID' });
		}

		if (!canvasCourseId) {
			return res.status(400).json({ success: false, message: 'canvasCourseId is required' });
		}

		const isOwner = await courseQueries.isCourseOwner(userId, courseId);
		if (!isOwner) {
			return res.status(403).json({ success: false, message: 'Access denied' });
		}

		const link = await linkOrchardCourseToCanvas({
			courseId,
			teacherId: userId,
			canvasCourseId,
		});

		res.json({
			success: true,
			data: {
				canvas: formatCourseCanvasLink(link),
			},
		});
	} catch (error) {
		console.error('Canvas link course error:', error);
		const status = error.statusCode || 500;
		res.status(status).json({
			success: false,
			message: error.message || 'Failed to link Canvas course',
		});
	}
});

/**
 * DELETE /api/courses/:courseId/canvas/link
 * Unlink an Orchard course from Canvas (owner only)
 */
router.delete('/:courseId/canvas/link', requireRole('teacher'), async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.session.userId;

		if (!isValidUUID(courseId)) {
			return res.status(400).json({ success: false, message: 'Invalid course ID' });
		}

		const isOwner = await courseQueries.isCourseOwner(userId, courseId);
		if (!isOwner) {
			return res.status(403).json({ success: false, message: 'Access denied' });
		}

		await canvasQueries.deleteCourseCanvasLink(courseId);

		res.json({
			success: true,
			data: { connected: false },
		});
	} catch (error) {
		console.error('Canvas unlink course error:', error);
		res.status(500).json({ success: false, message: 'Failed to unlink Canvas course' });
	}
});

/**
 * GET /api/courses/:courseId
 * Get a specific course
 */
router.get('/:courseId', async (req, res) => {
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

		// Get course data
		let course;
		if (role === 'teacher' && isOwner) {
			course = await courseQueries.getCourseWithStudentCount(courseId);
		} else {
			course = await courseQueries.getCourseById(courseId);
		}

		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		// Format course to match frontend expectations
		const formattedCourse = {
			id: course.id,
			name: course.name,
			description: course.description || '',
			teacherId: course.teacher_id,
			teacherName: course.teacher_name,
			joinCode: course.join_code,
			createdAt: course.created_at.toISOString(),
			...(role === 'teacher' && course.student_count !== undefined && {
				studentCount: parseInt(course.student_count) || 0,
			}),
		};

		if (role === 'teacher' && isOwner) {
			const canvasLink = await canvasQueries.getCourseCanvasLink(courseId);
			const formattedCanvas = formatCourseCanvasLink(canvasLink);
			if (formattedCanvas) {
				formattedCourse.canvas = formattedCanvas;
			}
		}

		res.json({
			success: true,
			data: {
				course: formattedCourse,
			},
		});
	} catch (error) {
		console.error('Get course error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * POST /api/courses
 * Create a new course (teachers only)
 */
router.post('/', requireRole('teacher'), async (req, res) => {
	try {
		const { name, description } = req.body;
		const teacherId = req.session.userId;

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Course name is required',
			});
		}

		const course = await courseQueries.createCourse(
			name.trim(),
			description?.trim() || '',
			teacherId
		);

		// Get teacher name
		const teacher = await userQueries.getUserById(teacherId);

		// Format course to match frontend expectations
		const formattedCourse = {
			id: course.id,
			name: course.name,
			description: course.description || '',
			teacherId: course.teacher_id,
			teacherName: teacher?.name,
			joinCode: course.join_code,
			createdAt: course.created_at.toISOString(),
			studentCount: 0,
		};

		res.json({
			success: true,
			data: {
				course: formattedCourse,
			},
		});
	} catch (error) {
		console.error('Create course error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * PUT /api/courses/:courseId
 * Update a course (owner only)
 */
router.put('/:courseId', async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.session.userId;
		const { name, description } = req.body;

		if (!isValidUUID(courseId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid course ID',
			});
		}

		// Check ownership
		const isOwner = await courseQueries.isCourseOwner(userId, courseId);
		if (!isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		// Update course
		const course = await courseQueries.updateCourse(
			courseId,
			name?.trim(),
			description?.trim()
		);

		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		// Get teacher name
		const teacher = await userQueries.getUserById(course.teacher_id);
		// Format course to match frontend expectations
		const formattedCourse = {
			id: course.id,
			name: course.name,
			description: course.description || '',
			teacherId: course.teacher_id,
			teacherName: teacher?.name,
			joinCode: course.join_code,
			createdAt: course.created_at.toISOString(),
		};

		res.json({
			success: true,
			data: {
				course: formattedCourse,
			},
		});
	} catch (error) {
		console.error('Update course error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});


/**
 * DELETE /api/courses/:courseId
 * Delete a course (owner only, teachers)
 */
router.delete('/:courseId', requireRole('teacher'), async (req, res) => {
	try {
		const { courseId } = req.params;
		const userId = req.session.userId;

		if (!isValidUUID(courseId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid course ID',
			});
		}

		// Check ownership
		const isOwner = await courseQueries.isCourseOwner(userId, courseId);
		if (!isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		// Delete course
		const deleted = await courseQueries.deleteCourse(courseId);
		if (!deleted) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		return res.json({
			success: true,
			data: {
				id: deleted.id,
			},
		});
	} catch (error) {
		console.error('Delete course error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * POST /api/courses/join
 * Join a course using join code (students only)
 */
router.post('/join', requireRole('student'), async (req, res) => {
	try {
		const { joinCode } = req.body;
		const studentId = req.session.userId;

		if (!joinCode || typeof joinCode !== 'string' || joinCode.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Join code is required',
			});
		}

		// Find course by join code
		const course = await courseQueries.getCourseByJoinCode(joinCode.trim().toUpperCase());
		if (!course) {
			return res.status(404).json({
				success: false,
				message: 'Course not found',
			});
		}

		// Check if already enrolled
		const isEnrolled = await courseQueries.isEnrolled(studentId, course.id);
		if (isEnrolled) {
			return res.status(409).json({
				success: false,
				message: 'Already enrolled in this course',
			});
		}

		// Enroll student
		await courseQueries.enrollStudent(course.id, studentId);

		// Get updated course data
		const updatedCourse = await courseQueries.getCourseById(course.id);

		// Format course to match frontend expectations
		const formattedCourse = {
			id: updatedCourse.id,
			name: updatedCourse.name,
			description: updatedCourse.description || '',
			teacherId: updatedCourse.teacher_id,
			teacherName: updatedCourse.teacher_name,
			joinCode: updatedCourse.join_code,
			createdAt: updatedCourse.created_at.toISOString(),
		};

		res.json({
			success: true,
			data: {
				course: formattedCourse,
			},
		});
	} catch (error) {
		console.error('Join course error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

export default router;
