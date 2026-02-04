import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection configuration
const postgresConfig = {
	host: process.env.POSTGRES_HOST || 'localhost',
	port: process.env.POSTGRES_PORT || 5432,
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PWD,
};

// Create PostgreSQL connection pool
const pool = new Pool(postgresConfig);

// Test database connection
pool.on('connect', () => {
	console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
	console.error('Unexpected error on idle PostgreSQL client', err);
	process.exit(-1);
});

// Test connection on startup
(async () => {
	try {
		const client = await pool.connect();
		console.log('PostgreSQL connection test successful');
		client.release();
	} catch (err) {
		console.error('Failed to connect to PostgreSQL:', err.message);
	}
})();

export { pool };
