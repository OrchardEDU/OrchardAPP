import express from 'express';
import { hashPassword, verifyPassword, sanitizeUser } from '../utils/auth.js';
import { isValidEmail, isValidPassword, isValidRole, sanitizeString } from '../utils/validation.js';
import * as userQueries from '../db/queries/users.js';

const router = express.Router();

// Demo mode configuration
const DEMO_MODE =
	`${process.env.DEMO_MODE || ''}`.toLowerCase() === 'true' ||
	`${process.env.DEMO_MODE || ''}` === '1';
const DEMO_PWD = process.env.DEMO_PWD || '';

if (DEMO_MODE && !DEMO_PWD) {
	console.warn(
		'DEMO_MODE is enabled but DEMO_PWD is not set. Demo gate will reject all attempts.'
	);
}

/**
 * Enforce demo access code only for teacher registration when demo mode is enabled.
 * Returns true if request may proceed, false if it has already been handled.
 */
function ensureTeacherSignupDemoAccess(req, res) {
	if (!DEMO_MODE) {
		return true;
	}

	const role = sanitizeString(req.body?.role || '', 20);
	if (role !== 'teacher') {
		return true;
	}

	const rawCode = req.body?.demoCode;
	const demoCode = sanitizeString(rawCode || '', 128);

	if (!demoCode) {
		res.status(403).json({
			success: false,
			message: 'Demo access code required for teacher signup',
		});
		return false;
	}

	if (!DEMO_PWD || demoCode !== DEMO_PWD) {
		res.status(403).json({
			success: false,
			message: 'Invalid demo access code',
		});
		return false;
	}

	return true;
}

/**
 * GET /api/auth/config
 * Lightweight auth configuration for the client (no secrets)
 */
router.get('/config', (req, res) => {
	res.json({
		success: true,
		data: {
			demoMode: DEMO_MODE,
		},
	});
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
	try {
		let { email, password, name, role } = req.body;

		// Basic sanitization
		email = sanitizeString(email, 254);
		name = sanitizeString(name, 255);
		role = sanitizeString(role, 20);

		// Validate input
		if (!email || !password || !name || !role) {
			return res.status(400).json({
				success: false,
				message: 'All fields are required',
			});
		}

		if (!isValidEmail(email)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid email format',
			});
		}

		if (!isValidPassword(password)) {
			return res.status(400).json({
				success: false,
				message: 'Password must be at least 6 characters',
			});
		}

		if (!isValidRole(role)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid role',
			});
		}

		// Enforce demo access only for teacher signup when enabled
		if (!ensureTeacherSignupDemoAccess(req, res)) {
			return;
		}

		// Check if email already exists
		const emailExists = await userQueries.emailExists(email);
		if (emailExists) {
			return res.status(409).json({
				success: false,
				message: 'Email already registered',
			});
		}

		// Hash password
		const passwordHash = await hashPassword(password);

		// Create user
		const user = await userQueries.createUser(email, passwordHash, name, role);

		// Create session
		req.session.userId = user.id;
		req.session.role = user.role;

		// Return user data (without password)
		res.json({
			success: true,
			data: {
				user: sanitizeUser(user),
			},
		});
	} catch (error) {
		console.error('Register error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
	try {
		let { email, password } = req.body;

		// Basic sanitization
		email = sanitizeString(email, 254);

		// Validate input
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Email and password are required',
			});
		}

		// Get user by email
		const user = await userQueries.getUserByEmail(email);
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password',
			});
		}

		// Verify password
		const isValid = await verifyPassword(password, user.password_hash);
		if (!isValid) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password',
			});
		}

		// Create session
		// Explicitly save session to ensure cookie is set with correct attributes
		req.session.userId = user.id;
		req.session.role = user.role;
		
		// Save session explicitly to ensure it's persisted and cookie is set
		req.session.save((err) => {
			if (err) {
				console.error('Session save error on login:', err);
				return res.status(500).json({
					success: false,
					message: 'Internal server error',
				});
			}

			// Return user data (without password)
			res.json({
				success: true,
				data: {
					user: sanitizeUser(user),
				},
			});
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * GET /api/auth/me
 * Get current user from session
 */
router.get('/me', async (req, res) => {
	try {
		if (!req.session || !req.session.userId) {
			return res.status(401).json({
				success: false,
				message: 'Bad email or password',
			});
		}

		const user = await userQueries.getUserById(req.session.userId);
		if (!user) {
			// Session has invalid user ID
			req.session.destroy();
			return res.status(401).json({
				success: false,
				message: 'Bad email or password',
			});
		}

		res.json({
			success: true,
			data: {
				user: sanitizeUser(user),
			},
		});
	} catch (error) {
		console.error('Get me error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', (req, res) => {
	// Clear cookie first (before destroying session) to ensure it's removed
	// Clear with all possible configurations to handle both secure and non-secure cookies
	res.clearCookie('connect.sid', {
		httpOnly: true,
		secure: false, // Clear both secure and non-secure versions
		sameSite: 'lax',
		path: '/',
	});
	
	req.session.destroy((err) => {
		if (err) {
			console.error('Logout error:', err);
			return res.status(500).json({
				success: false,
				message: 'Internal server error',
			});
		}

		// Also clear with secure: true in case cookie was set as secure
		res.clearCookie('connect.sid', {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
		});

		res.json({
			success: true,
			message: 'Logged out successfully',
		});
	});
});

export default router;
