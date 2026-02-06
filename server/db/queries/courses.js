import { pool } from '../connection.js';
import { randomBytes } from 'crypto';

/**
 * Generate a unique join code
 */
function generateJoinCode() {
	return randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Get all courses for a user (owned if teacher, enrolled if student)
 */
export async function getCoursesForUser(userId, role) {
	if (role === 'teacher') {
		// Get courses owned by teacher
		const result = await pool.query(
			`SELECT 
				c.id, c.name, c.description, c.teacher_id, c.join_code, 
				c.created_at, c.updated_at,
				u.name as teacher_name,
				COUNT(DISTINCT e.student_id) as student_count
			FROM courses c
			LEFT JOIN users u ON c.teacher_id = u.id
			LEFT JOIN enrollments e ON c.id = e.course_id
			WHERE c.teacher_id = $1
			GROUP BY c.id, u.name
			ORDER BY c.created_at DESC`,
			[userId]
		);
		return result.rows;
	} else {
		// Get courses enrolled by student
		const result = await pool.query(
			`SELECT 
				c.id, c.name, c.description, c.teacher_id, c.join_code,
				c.created_at, c.updated_at,
				u.name as teacher_name,
				e.enrolled_at
			FROM enrollments e
			JOIN courses c ON e.course_id = c.id
			LEFT JOIN users u ON c.teacher_id = u.id
			WHERE e.student_id = $1
			ORDER BY e.enrolled_at DESC`,
			[userId]
		);
		return result.rows;
	}
}

/**
 * Get course by ID
 */
export async function getCourseById(courseId) {
	const result = await pool.query(
		`SELECT 
			c.id, c.name, c.description, c.teacher_id, c.join_code,
			c.created_at, c.updated_at,
			u.name as teacher_name
		FROM courses c
		LEFT JOIN users u ON c.teacher_id = u.id
		WHERE c.id = $1`,
		[courseId]
	);
	return result.rows[0] || null;
}

/**
 * Get course with student count (for teachers)
 */
export async function getCourseWithStudentCount(courseId) {
	const result = await pool.query(
		`SELECT 
			c.id, c.name, c.description, c.teacher_id, c.join_code,
			c.created_at, c.updated_at,
			u.name as teacher_name,
			COUNT(DISTINCT e.student_id) as student_count
		FROM courses c
		LEFT JOIN users u ON c.teacher_id = u.id
		LEFT JOIN enrollments e ON c.id = e.course_id
		WHERE c.id = $1
		GROUP BY c.id, u.name`,
		[courseId]
	);
	return result.rows[0] || null;
}

/**
 * Check if user is enrolled in course
 */
export async function isEnrolled(studentId, courseId) {
	const result = await pool.query(
		'SELECT EXISTS(SELECT 1 FROM enrollments WHERE student_id = $1 AND course_id = $2)',
		[studentId, courseId]
	);
	return result.rows[0].exists;
}

/**
 * Check if user owns course
 */
export async function isCourseOwner(userId, courseId) {
	const result = await pool.query(
		'SELECT EXISTS(SELECT 1 FROM courses WHERE id = $1 AND teacher_id = $2)',
		[courseId, userId]
	);
	return result.rows[0].exists;
}

/**
 * Create a new course
 */
export async function createCourse(name, description, teacherId) {
	// Generate unique join code
	let joinCode;
	let exists = true;
	while (exists) {
		joinCode = generateJoinCode();
		const result = await pool.query(
			'SELECT EXISTS(SELECT 1 FROM courses WHERE join_code = $1)',
			[joinCode]
		);
		exists = result.rows[0].exists;
	}

	const result = await pool.query(
		`INSERT INTO courses (name, description, teacher_id, join_code)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, name, description, teacher_id, join_code, created_at, updated_at`,
		[name, description, teacherId, joinCode]
	);
	return result.rows[0];
}

/**
 * Update course
 */
export async function updateCourse(courseId, name, description) {
	const result = await pool.query(
		`UPDATE courses 
		 SET name = COALESCE($1, name), 
		     description = COALESCE($2, description),
		     updated_at = CURRENT_TIMESTAMP
		 WHERE id = $3
		 RETURNING id, name, description, teacher_id, join_code, created_at, updated_at`,
		[name, description, courseId]
	);
	return result.rows[0] || null;
}

/**
 * Get course by join code
 */
export async function getCourseByJoinCode(joinCode) {
	const result = await pool.query(
		`SELECT 
			c.id, c.name, c.description, c.teacher_id, c.join_code,
			c.created_at, c.updated_at,
			u.name as teacher_name
		FROM courses c
		LEFT JOIN users u ON c.teacher_id = u.id
		WHERE c.join_code = $1`,
		[joinCode]
	);
	return result.rows[0] || null;
}

/**
 * Enroll student in course
 */
export async function enrollStudent(courseId, studentId) {
	const result = await pool.query(
		`INSERT INTO enrollments (course_id, student_id)
		 VALUES ($1, $2)
		 ON CONFLICT (course_id, student_id) DO NOTHING
		 RETURNING id, course_id, student_id, enrolled_at`,
		[courseId, studentId]
	);
	return result.rows[0];

}
/**
 * Delete course (owner only - ownership is checked in route layer)
 */
export async function deleteCourse(courseId) {
	const result = await pool.query(
		`DELETE FROM courses
		 WHERE id = $1
		 RETURNING id`,
		[courseId]
	);
	return result.rows[0] || null;
}

/**
 * Get enrolled students for a course
 */
export async function getEnrolledStudents(courseId) {
	const result = await pool.query(
		`SELECT 
			u.id, u.name, u.email, e.enrolled_at
		FROM enrollments e
		JOIN users u ON e.student_id = u.id
		WHERE e.course_id = $1
		ORDER BY e.enrolled_at ASC`,
		[courseId]
	);
	return result.rows;
}

/**
 * Remove student from course (unenroll)
 */
export async function removeStudent(courseId, studentId) {
	const result = await pool.query(
		`DELETE FROM enrollments
		 WHERE course_id = $1 AND student_id = $2
		 RETURNING id`,
		[courseId, studentId]
	);
	return result.rows[0] || null;
}
