/**
 * Canvas OAuth configuration from environment variables.
 * For local dev, point CANVAS_BASE_URL at your local Canvas install.
 */
export function getCanvasConfig() {
	const baseUrl = (process.env.CANVAS_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
	const clientId = process.env.CANVAS_CLIENT_ID || '';
	const clientSecret = process.env.CANVAS_CLIENT_SECRET || '';
	const redirectUri =
		process.env.CANVAS_REDIRECT_URI ||
		`http://localhost:${process.env.PORT || 8086}/api/canvas/oauth/callback`;
	const institutionName = process.env.CANVAS_INSTITUTION_NAME || 'Local Canvas';

	return {
		baseUrl,
		clientId,
		clientSecret,
		redirectUri,
		institutionName,
	};
}

export function isCanvasConfigured() {
	const config = getCanvasConfig();
	return Boolean(config.clientId && config.clientSecret && config.baseUrl);
}

export function assertCanvasConfigured() {
	if (!isCanvasConfigured()) {
		throw new Error(
			'Canvas is not configured. Set CANVAS_BASE_URL, CANVAS_CLIENT_ID, and CANVAS_CLIENT_SECRET in .env'
		);
	}
}

/** Scopes requested during OAuth (must be enabled on the Canvas developer key). */
export const CANVAS_OAUTH_SCOPES = [
	'url:GET|/api/v1/courses',
	'url:GET|/api/v1/courses/:course_id/modules',
	'url:GET|/api/v1/courses/:course_id/enrollments',
	'url:GET|/api/v1/users/self',
].join(' ');
