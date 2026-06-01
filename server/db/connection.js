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

pool.on('error', (err) => {
	console.error('Unexpected error on idle PostgreSQL client', err);
	process.exit(-1);
});

// Test connection on startup — one success line, errors only on failure
(async () => {
	try {
		const client = await pool.connect();
		client.release();
		console.log('Connected to PostgreSQL database');
	} catch (err) {
		console.error('Failed to connect to PostgreSQL:', err.message);
	}
})();

export { pool };
