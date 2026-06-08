import { CANVAS_OAUTH_SCOPES } from '../../config/canvas.js';
import * as canvasQueries from '../../db/queries/canvas.js';

const LOG_COURSE_DETAIL_LIMIT = 5;

export function logCanvasSyncData(label, data) {
	console.log(`\n=== Canvas Sync: ${label} ===`);
	console.log(JSON.stringify(data, null, 2));
	console.log('=== End Canvas Sync ===\n');
}

export function buildAuthUrl(institution, state) {
	const params = new URLSearchParams({
		client_id: institution.client_id,
		response_type: 'code',
		redirect_uri: institution.redirect_uri,
		state,
		scope: CANVAS_OAUTH_SCOPES,
	});
	return `${institution.base_url}/login/oauth2/auth?${params.toString()}`;
}

/** Canvas logout then return to OAuth — lets a different user sign in. */
export function buildCanvasReauthUrl(institution, state) {
	const authUrl = buildAuthUrl(institution, state);
	return `${institution.base_url}/login/logout?return_to=${encodeURIComponent(authUrl)}`;
}

export async function revokeAccessToken(institution, accessToken) {
	const response = await fetch(`${institution.base_url}/login/oauth2/token`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const errorBody = await response.text().catch(() => '');
		throw new Error(
			`Canvas token revoke failed ${response.status}: ${errorBody || response.statusText}`
		);
	}
}

async function postTokenRequest(institution, bodyParams) {
	const body = new URLSearchParams(bodyParams);
	const response = await fetch(`${institution.base_url}/login/oauth2/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: body.toString(),
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		const message = data.error_description || data.error || 'Canvas token request failed';
		console.error('Canvas token request failed:', {
			status: response.status,
			error: data.error,
			errorDescription: data.error_description,
		});
		throw new Error(message);
	}
	if (!data.access_token) {
		console.error('Canvas token response missing access_token:', data);
		throw new Error('Canvas token response did not include an access token');
	}
	return data;
}

export async function exchangeCodeForToken(institution, code) {
	return postTokenRequest(institution, {
		grant_type: 'authorization_code',
		client_id: institution.client_id,
		client_secret: institution.client_secret,
		redirect_uri: institution.redirect_uri,
		code,
	});
}

export async function refreshAccessToken(institution, refreshToken) {
	return postTokenRequest(institution, {
		grant_type: 'refresh_token',
		client_id: institution.client_id,
		client_secret: institution.client_secret,
		refresh_token: refreshToken,
	});
}

export async function canvasRequest(institution, accessToken, path, options = {}) {
	const url = path.startsWith('http') ? path : `${institution.base_url}${path}`;
	const response = await fetch(url, {
		...options,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
			...(options.headers || {}),
		},
	});

	if (!response.ok) {
		const errorBody = await response.text().catch(() => '');
		throw new Error(`Canvas API error ${response.status}: ${errorBody || response.statusText}`);
	}

	return response.json();
}

export function tokenExpiresAtFromResponse(tokenResponse) {
	const expiresIn = Number(tokenResponse.expires_in || 3600);
	return new Date(Date.now() + expiresIn * 1000);
}

export async function getValidAccessToken(connection) {
	const expiresAt = new Date(connection.token_expires_at);
	const bufferMs = 60 * 1000;
	if (expiresAt.getTime() - bufferMs > Date.now()) {
		return {
			accessToken: connection.access_token,
			refreshToken: connection.refresh_token,
			connection,
		};
	}

	const institution = {
		base_url: connection.base_url,
		client_id: connection.client_id,
		client_secret: connection.client_secret,
		redirect_uri: connection.redirect_uri,
	};

	const tokenResponse = await refreshAccessToken(institution, connection.refresh_token);
	const updated = await canvasQueries.updateTeacherConnectionTokens(connection.id, {
		accessToken: tokenResponse.access_token,
		refreshToken: tokenResponse.refresh_token || connection.refresh_token,
		tokenExpiresAt: tokenExpiresAtFromResponse(tokenResponse),
	});

	return {
		accessToken: updated.access_token,
		refreshToken: updated.refresh_token,
		connection: { ...connection, ...updated },
	};
}

export async function getCanvasUserSelf(institution, accessToken) {
	return canvasRequest(institution, accessToken, '/api/v1/users/self');
}

export async function getTeacherCourses(institution, accessToken) {
	return canvasRequest(
		institution,
		accessToken,
		'/api/v1/courses?enrollment_type=teacher&per_page=100'
	);
}

export async function getCourseModules(institution, accessToken, canvasCourseId) {
	return canvasRequest(
		institution,
		accessToken,
		`/api/v1/courses/${canvasCourseId}/modules?per_page=100`
	);
}

export async function getCourseStudents(institution, accessToken, canvasCourseId) {
	return canvasRequest(
		institution,
		accessToken,
		`/api/v1/courses/${canvasCourseId}/enrollments?type[]=Student&per_page=100`
	);
}

export async function getCanvasCourse(institution, accessToken, canvasCourseId) {
	return canvasRequest(institution, accessToken, `/api/v1/courses/${canvasCourseId}`);
}

export function buildCanvasCourseUrl(baseUrl, canvasCourseId) {
	return `${baseUrl.replace(/\/$/, '')}/courses/${canvasCourseId}`;
}

export async function logTeacherCanvasData(institution, accessToken, { label = 'OAuth callback' } = {}) {
	const courses = await getTeacherCourses(institution, accessToken);
	const courseSummaries = (Array.isArray(courses) ? courses : []).map(course => ({
		id: course.id,
		name: course.name,
		course_code: course.course_code,
		workflow_state: course.workflow_state,
	}));

	logCanvasSyncData(`${label} - courses`, courseSummaries);

	const coursesToDetail = courseSummaries.slice(0, LOG_COURSE_DETAIL_LIMIT);
	for (const course of coursesToDetail) {
		try {
			const [modules, students] = await Promise.all([
				getCourseModules(institution, accessToken, course.id),
				getCourseStudents(institution, accessToken, course.id),
			]);

			logCanvasSyncData(`${label} - course ${course.id} modules`, modules);
			logCanvasSyncData(`${label} - course ${course.id} students`, students);
		} catch (error) {
			console.error(`Failed to fetch Canvas details for course ${course.id}:`, error.message);
		}
	}
}

export async function logLinkedCourseData(institution, accessToken, canvasCourseId) {
	const [modules, students] = await Promise.all([
		getCourseModules(institution, accessToken, canvasCourseId),
		getCourseStudents(institution, accessToken, canvasCourseId),
	]);

	logCanvasSyncData(`Course link - ${canvasCourseId} modules`, modules);
	logCanvasSyncData(`Course link - ${canvasCourseId} students`, students);
}

export function formatTokenResponseForLog(tokenResponse, canvasUserId) {
	return {
		canvasUserId: canvasUserId || tokenResponse.user?.id || null,
		tokenType: tokenResponse.token_type,
		expiresIn: tokenResponse.expires_in,
		scope: tokenResponse.scope,
	};
}
