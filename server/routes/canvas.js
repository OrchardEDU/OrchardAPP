import crypto from 'crypto';
import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { assertCanvasConfigured, getCanvasConfig } from '../config/canvas.js';
import * as canvasQueries from '../db/queries/canvas.js';
import * as canvasClient from '../services/canvas/client.js';

const router = express.Router();

function formatConnectionStatus(connection) {
	if (!connection) {
		return { connected: false };
	}

	return {
		connected: true,
		canvasUserId: connection.canvas_user_id,
		connectedAt: connection.connected_at?.toISOString?.() || connection.connected_at,
		institutionName: connection.institution_name,
	};
}

/**
 * GET /api/canvas/oauth/start
 * Start Canvas OAuth flow (teacher must be logged in)
 */
router.get('/oauth/start', requireAuth, requireRole('teacher'), async (req, res) => {
	try {
		assertCanvasConfigured();
		const config = getCanvasConfig();
		const institution = await canvasQueries.getOrCreateDefaultInstitution(config);

		const state = crypto.randomBytes(32).toString('hex');
		req.session.canvasOAuthState = state;
		req.session.canvasInstitutionId = institution.id;

		await new Promise((resolve, reject) => {
			req.session.save(err => (err ? reject(err) : resolve()));
		});

		const reauth = req.query.reauth === '1';
		const redirectUrl = reauth
			? canvasClient.buildCanvasReauthUrl(institution, state)
			: canvasClient.buildAuthUrl(institution, state);

		console.log(reauth ? 'Canvas OAuth starting with re-auth (logout first)' : 'Canvas OAuth starting');
		res.redirect(redirectUrl);
	} catch (error) {
		console.error('Canvas OAuth start error:', error.message, error.stack);
		res.redirect('/dashboard/teacher/settings?canvas=error&message=oauth_start_failed');
	}
});

/**
 * GET /api/canvas/oauth/callback
 * Canvas OAuth callback
 */
router.get('/oauth/callback', async (req, res) => {
	const redirectError = (message = 'oauth_failed', details) => {
		if (details) {
			console.error(`Canvas OAuth callback failed (${message}):`, details);
		} else {
			console.error(`Canvas OAuth callback failed: ${message}`);
		}
		res.redirect(`/dashboard/teacher/settings?canvas=error&message=${encodeURIComponent(message)}`);
	};

	try {
		const { code, state, error, error_description: errorDescription } = req.query;

		if (error) {
			return redirectError(String(error), { errorDescription });
		}

		if (!req.session?.userId || req.session.role !== 'teacher') {
			return redirectError('not_authenticated', {
				hasSession: Boolean(req.session),
				userId: req.session?.userId,
				role: req.session?.role,
			});
		}

		if (!code || !state || state !== req.session.canvasOAuthState) {
			return redirectError('invalid_state', {
				hasCode: Boolean(code),
				hasState: Boolean(state),
				stateMatches: state === req.session.canvasOAuthState,
			});
		}

		if (!req.session.canvasInstitutionId) {
			return redirectError('missing_institution');
		}

		const config = getCanvasConfig();
		const institution = await canvasQueries.getOrCreateDefaultInstitution(config);

		const tokenResponse = await canvasClient.exchangeCodeForToken(institution, code);
		if (!tokenResponse.refresh_token) {
			return redirectError('missing_refresh_token', {
				hasAccessToken: Boolean(tokenResponse.access_token),
			});
		}

		const canvasUser = await canvasClient.getCanvasUserSelf(institution, tokenResponse.access_token);

		await canvasQueries.upsertTeacherConnection({
			teacherId: req.session.userId,
			institutionId: institution.id,
			canvasUserId: canvasUser.id,
			accessToken: tokenResponse.access_token,
			refreshToken: tokenResponse.refresh_token,
			tokenExpiresAt: canvasClient.tokenExpiresAtFromResponse(tokenResponse),
		});

		canvasClient.logCanvasSyncData(
			'OAuth token response',
			canvasClient.formatTokenResponseForLog(tokenResponse, canvasUser.id)
		);

		try {
			await canvasClient.logTeacherCanvasData(institution, tokenResponse.access_token, {
				label: 'OAuth callback',
			});
		} catch (syncError) {
			console.error('Canvas OAuth sync logging failed (connection still saved):', syncError);
		}

		delete req.session.canvasOAuthState;
		delete req.session.canvasInstitutionId;

		await new Promise((resolve, reject) => {
			req.session.save(err => (err ? reject(err) : resolve()));
		});

		console.log('Canvas OAuth connected for teacher:', req.session.userId, 'canvas user:', canvasUser.id);
		res.redirect('/dashboard/teacher/settings?canvas=connected');
	} catch (error) {
		console.error('Canvas OAuth callback error:', error.message, error.stack);
		redirectError('oauth_callback_failed', { message: error.message });
	}
});

router.use(requireAuth);
router.use(requireRole('teacher'));

/**
 * GET /api/canvas/status
 */
router.get('/status', async (req, res) => {
	try {
		const connection = await canvasQueries.getTeacherConnectionByTeacherId(req.session.userId);
		res.json({
			success: true,
			data: formatConnectionStatus(connection),
		});
	} catch (error) {
		console.error('Canvas status error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

/**
 * DELETE /api/canvas/disconnect
 */
router.delete('/disconnect', async (req, res) => {
	try {
		const connection = await canvasQueries.getTeacherConnectionByTeacherId(req.session.userId);
		if (connection) {
			const institution = {
				base_url: connection.base_url,
				client_id: connection.client_id,
				client_secret: connection.client_secret,
				redirect_uri: connection.redirect_uri,
			};

			try {
				const { accessToken } = await canvasClient.getValidAccessToken(connection);
				await canvasClient.revokeAccessToken(institution, accessToken);
				console.log('Canvas OAuth token revoked for teacher:', req.session.userId);
			} catch (revokeError) {
				console.error(
					'Canvas token revoke failed (continuing with local disconnect):',
					revokeError.message
				);
			}

			await canvasQueries.deleteCourseLinksForTeacher(req.session.userId);
			await canvasQueries.deleteTeacherConnectionsForTeacher(req.session.userId);
		}

		delete req.session.canvasOAuthState;
		delete req.session.canvasInstitutionId;

		await new Promise((resolve, reject) => {
			req.session.save(err => (err ? reject(err) : resolve()));
		});

		console.log('Canvas disconnected for teacher:', req.session.userId);
		res.json({ success: true, data: { connected: false } });
	} catch (error) {
		console.error('Canvas disconnect error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
});

/**
 * GET /api/canvas/courses
 * List Canvas courses for the connected teacher
 */
router.get('/courses', async (req, res) => {
	try {
		const connection = await canvasQueries.getTeacherConnectionByTeacherId(req.session.userId);
		if (!connection) {
			return res.status(400).json({
				success: false,
				message: 'Canvas is not connected. Connect in Settings first.',
			});
		}

		const institution = {
			base_url: connection.base_url,
			client_id: connection.client_id,
			client_secret: connection.client_secret,
			redirect_uri: connection.redirect_uri,
		};

		const { accessToken } = await canvasClient.getValidAccessToken(connection);
		const courses = await canvasClient.getTeacherCourses(institution, accessToken);
		const activeCourses = (Array.isArray(courses) ? courses : []).filter(
			course => course.workflow_state === 'available' || course.workflow_state === 'unpublished'
		);

		res.json({
			success: true,
			data: {
				courses: activeCourses.map(course => ({
					id: course.id,
					name: course.name,
					courseCode: course.course_code,
					workflowState: course.workflow_state,
				})),
			},
		});
	} catch (error) {
		console.error('Canvas list courses error:', error);
		res.status(500).json({ success: false, message: 'Failed to fetch Canvas courses' });
	}
});

export default router;
