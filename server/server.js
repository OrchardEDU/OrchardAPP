import express from 'express';
import next from 'next';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

// Import database connection
import { pool } from './db/connection.js';

// Import route modules
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import quizRoutes from './routes/quizzes.js';
import demoRoutes from './routes/demo.js';
import aiRoutes from './routes/ai.js';

// Import middleware
import { createRequestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8086;
const IP = process.env.IP || 'localhost';
const ENABLE_FRONTEND_LOGGING = false;

// Configure Next.js to serve the built client app
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({
	dev,
	dir: path.join(__dirname, '../client'),
	quiet: true, // Suppress Next.js compilation/output messages
});
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
	console.log('\n=== Server Starting ===');
	const expressApp = express();

	// Trust proxy ONLY in production (needed to read X-Forwarded-Proto from Cloudflare)
	const isProduction = process.env.NODE_ENV === 'production';
	if (isProduction) {
		expressApp.set('trust proxy', 1);
	}

	// Middleware to parse JSON bodies
	expressApp.use(express.json({ limit: '1mb' }));
	expressApp.use(express.urlencoded({ extended: true }));

	// Configure session store
	const PgSession = connectPgSimple(session);
	const sessionStore = new PgSession({
		pool: pool,
		tableName: 'session', // Use 'session' table name
		createTableIfMissing: true,
	});

	// Configure session middleware
	// Cookie secure flag: dynamic in production (checks actual protocol), static in dev
	// - Production: secure = dynamic (true only if actually HTTPS via Cloudflare)
	// - Development: secure = false (HTTP on localhost)
	const cookieConfig = {
		httpOnly: true,
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
	};

	if (isProduction) {
		// Production: dynamic secure based on actual protocol
		// This ensures cookies are only set as secure when actually using HTTPS
		// Works correctly with trust proxy to read X-Forwarded-Proto from Cloudflare
		cookieConfig.secure = (req) => {
			// Only set secure cookies when actually using HTTPS
			// req.protocol works correctly with trust proxy enabled
			return req.protocol === 'https' || req.secure === true;
		};
		// sameSite: 'lax' is required for secure cookies and works with non-secure too
		// Modern browsers support sameSite on non-secure cookies for same-site requests
		// Since we're using credentials: 'include' and same-origin requests, this should work
		cookieConfig.sameSite = 'lax';
	} else {
		// Development: secure is false, no sameSite to avoid any potential issues
		cookieConfig.secure = false;
	}
	
	// Add middleware to ensure cookies work correctly with credentials: 'include'
	// This is especially important for production mode testing on localhost
	expressApp.use((req, res, next) => {
		// Ensure credentials are allowed (for same-origin, this is automatic, but explicit is better)
		// No CORS headers needed since Next.js and Express are same-origin
		next();
	});
	
	expressApp.use(
		session({
			store: sessionStore,
			secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
			resave: false,
			saveUninitialized: false,
			cookie: cookieConfig,
		})
	);

	// Middleware to fix cookie sameSite attribute when testing production on HTTP
	// express-session doesn't support sameSite as a function, so we fix it here
	if (isProduction) {
		expressApp.use((req, res, next) => {
			// Store original setHeader function
			const originalSetHeader = res.setHeader.bind(res);
			
			// Override setHeader to fix Set-Cookie header
			res.setHeader = function(name, value) {
				if (name.toLowerCase() === 'set-cookie' && Array.isArray(value)) {
					// Fix each cookie in the array
					value = value.map(cookie => {
						// If cookie has SameSite=Lax but connection is HTTP, remove SameSite
						// This allows cookies to work when testing production mode on localhost
						if (cookie.includes('SameSite=Lax') && req.protocol === 'http') {
							return cookie.replace(/;\s*SameSite=Lax/gi, '');
						}
						return cookie;
					});
				}
				return originalSetHeader(name, value);
			};
			
			next();
		});
	}

	// Request logging middleware (after session, before routes)
	expressApp.use(createRequestLogger(ENABLE_FRONTEND_LOGGING));

	// API routes
	expressApp.use('/api/auth', authRoutes);
	expressApp.use('/api/courses', courseRoutes);
	expressApp.use('/api/courses', quizRoutes); // Quiz routes handle /:courseId/quizzes internally
	expressApp.use('/api/demo', demoRoutes);
	expressApp.use('/api/ai', aiRoutes);

	// Example backend API route (keep for compatibility)
	expressApp.get('/api/hello', (req, res) => {
		res.json({ message: 'Hello from Express backend!' });
	});

	// Error handling middleware (must be last)
	expressApp.use(errorHandler);

	// Let Next handle all other routes
	expressApp.all(/.*/, (req, res) => {
		return handle(req, res);
	});

	const listener = expressApp.listen(PORT, IP, () => {
		console.log(`\nServer running on http://${IP}:${PORT}`);
		console.log(`Visit: http://${IP}:${PORT}`);
		console.log(`Session store: PostgreSQL`);
		console.log(`Request logging: ${ENABLE_FRONTEND_LOGGING ? 'Enabled' : 'Disabled'}\n`);
	});
});

// Pool is exported from db/connection.js for use in other modules
