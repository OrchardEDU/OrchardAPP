import { pool } from '../connection.js';

export async function getInstitutionByBaseUrl(baseUrl) {
	const result = await pool.query(
		'SELECT * FROM canvas_institutions WHERE base_url = $1',
		[baseUrl]
	);
	return result.rows[0] || null;
}

export async function getOrCreateDefaultInstitution(config) {
	const existing = await getInstitutionByBaseUrl(config.baseUrl);
	if (existing) {
		const result = await pool.query(
			`UPDATE canvas_institutions
			 SET name = $2, client_id = $3, client_secret = $4, redirect_uri = $5, updated_at = CURRENT_TIMESTAMP
			 WHERE base_url = $1
			 RETURNING *`,
			[config.baseUrl, config.institutionName, config.clientId, config.clientSecret, config.redirectUri]
		);
		return result.rows[0];
	}

	const result = await pool.query(
		`INSERT INTO canvas_institutions (name, base_url, client_id, client_secret, redirect_uri)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING *`,
		[config.institutionName, config.baseUrl, config.clientId, config.clientSecret, config.redirectUri]
	);
	return result.rows[0];
}

export async function getTeacherConnection(teacherId, institutionId) {
	const result = await pool.query(
		`SELECT tcc.*, ci.base_url, ci.client_id, ci.client_secret, ci.redirect_uri, ci.name AS institution_name
		 FROM teacher_canvas_connections tcc
		 JOIN canvas_institutions ci ON ci.id = tcc.institution_id
		 WHERE tcc.teacher_id = $1 AND tcc.institution_id = $2`,
		[teacherId, institutionId]
	);
	return result.rows[0] || null;
}

export async function getTeacherConnectionByTeacherId(teacherId) {
	const result = await pool.query(
		`SELECT tcc.*, ci.base_url, ci.client_id, ci.client_secret, ci.redirect_uri, ci.name AS institution_name
		 FROM teacher_canvas_connections tcc
		 JOIN canvas_institutions ci ON ci.id = tcc.institution_id
		 WHERE tcc.teacher_id = $1
		 ORDER BY tcc.connected_at DESC
		 LIMIT 1`,
		[teacherId]
	);
	return result.rows[0] || null;
}

export async function upsertTeacherConnection({
	teacherId,
	institutionId,
	canvasUserId,
	accessToken,
	refreshToken,
	tokenExpiresAt,
}) {
	const result = await pool.query(
		`INSERT INTO teacher_canvas_connections
			(teacher_id, institution_id, canvas_user_id, access_token, refresh_token, token_expires_at)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 ON CONFLICT (teacher_id, institution_id)
		 DO UPDATE SET
			canvas_user_id = EXCLUDED.canvas_user_id,
			access_token = EXCLUDED.access_token,
			refresh_token = EXCLUDED.refresh_token,
			token_expires_at = EXCLUDED.token_expires_at,
			updated_at = CURRENT_TIMESTAMP
		 RETURNING *`,
		[teacherId, institutionId, canvasUserId, accessToken, refreshToken, tokenExpiresAt]
	);
	return result.rows[0];
}

export async function updateTeacherConnectionTokens(connectionId, { accessToken, refreshToken, tokenExpiresAt }) {
	const result = await pool.query(
		`UPDATE teacher_canvas_connections
		 SET access_token = $2, refresh_token = $3, token_expires_at = $4, updated_at = CURRENT_TIMESTAMP
		 WHERE id = $1
		 RETURNING *`,
		[connectionId, accessToken, refreshToken, tokenExpiresAt]
	);
	return result.rows[0] || null;
}

export async function deleteTeacherConnection(teacherId, institutionId) {
	const result = await pool.query(
		`DELETE FROM teacher_canvas_connections
		 WHERE teacher_id = $1 AND institution_id = $2
		 RETURNING id`,
		[teacherId, institutionId]
	);
	return result.rows[0] || null;
}

export async function deleteTeacherConnectionsForTeacher(teacherId) {
	await pool.query('DELETE FROM teacher_canvas_connections WHERE teacher_id = $1', [teacherId]);
}

export async function deleteCourseLinksForTeacher(teacherId) {
	await pool.query(
		`DELETE FROM course_canvas_links
		 WHERE course_id IN (SELECT id FROM courses WHERE teacher_id = $1)`,
		[teacherId]
	);
}

export async function getCourseCanvasLink(courseId) {
	const result = await pool.query(
		`SELECT ccl.*, ci.base_url AS institution_base_url
		 FROM course_canvas_links ccl
		 JOIN courses c ON c.id = ccl.course_id
		 LEFT JOIN teacher_canvas_connections tcc ON tcc.teacher_id = c.teacher_id
		 LEFT JOIN canvas_institutions ci ON ci.id = tcc.institution_id
		 WHERE ccl.course_id = $1
		 LIMIT 1`,
		[courseId]
	);
	return result.rows[0] || null;
}

export async function upsertCourseCanvasLink({
	courseId,
	canvasCourseId,
	canvasCourseName,
	canvasCourseUrl,
}) {
	const result = await pool.query(
		`INSERT INTO course_canvas_links (course_id, canvas_course_id, canvas_course_name, canvas_course_url)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (course_id)
		 DO UPDATE SET
			canvas_course_id = EXCLUDED.canvas_course_id,
			canvas_course_name = EXCLUDED.canvas_course_name,
			canvas_course_url = EXCLUDED.canvas_course_url,
			updated_at = CURRENT_TIMESTAMP
		 RETURNING *`,
		[courseId, canvasCourseId, canvasCourseName, canvasCourseUrl]
	);
	return result.rows[0];
}

export async function deleteCourseCanvasLink(courseId) {
	const result = await pool.query(
		'DELETE FROM course_canvas_links WHERE course_id = $1 RETURNING id',
		[courseId]
	);
	return result.rows[0] || null;
}
