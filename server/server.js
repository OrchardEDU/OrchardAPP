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
	expressApp.use(
		session({
			store: sessionStore,
			secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: process.env.NODE_ENV === 'production',
				httpOnly: true,
				maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			},
		})
	);

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
