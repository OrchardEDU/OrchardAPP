import * as canvasQueries from '../../db/queries/canvas.js';
import * as canvasClient from './client.js';

export function formatCourseCanvasLink(link) {
	if (!link) {
		return undefined;
	}

	return {
		connected: true,
		canvasCourseId: Number(link.canvas_course_id),
		canvasCourseName: link.canvas_course_name,
		canvasCourseUrl: link.canvas_course_url,
		linkedAt: link.linked_at?.toISOString?.() || link.linked_at,
	};
}

export async function getTeacherCanvasConnection(teacherId) {
	return canvasQueries.getTeacherConnectionByTeacherId(teacherId);
}

export async function linkOrchardCourseToCanvas({ courseId, teacherId, canvasCourseId }) {
	const connection = await canvasQueries.getTeacherConnectionByTeacherId(teacherId);
	if (!connection) {
		const error = new Error('Canvas is not connected');
		error.statusCode = 400;
		throw error;
	}

	const institution = {
		base_url: connection.base_url,
		client_id: connection.client_id,
		client_secret: connection.client_secret,
		redirect_uri: connection.redirect_uri,
	};

	const { accessToken } = await canvasClient.getValidAccessToken(connection);
	const canvasCourse = await canvasClient.getCanvasCourse(institution, accessToken, canvasCourseId);
	const canvasCourseUrl = canvasClient.buildCanvasCourseUrl(connection.base_url, canvasCourseId);

	const link = await canvasQueries.upsertCourseCanvasLink({
		courseId,
		canvasCourseId: Number(canvasCourseId),
		canvasCourseName: canvasCourse.name || `Course ${canvasCourseId}`,
		canvasCourseUrl,
	});

	await canvasClient.logLinkedCourseData(institution, accessToken, canvasCourseId);

	return link;
}
