import express from 'express';
import { hashPassword, verifyPassword, sanitizeUser } from '../utils/auth.js';
import { isValidEmail, isValidPassword, isValidRole } from '../utils/validation.js';
import * as userQueries from '../db/queries/users.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
	try {
		const { email, password, name, role } = req.body;

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
		const { email, password } = req.body;

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
	req.session.destroy((err) => {
		if (err) {
			console.error('Logout error:', err);
			return res.status(500).json({
				success: false,
				message: 'Internal server error',
			});
		}

		res.clearCookie('connect.sid');
		res.json({
			success: true,
			message: 'Logged out successfully',
		});
	});
});

export default router;
