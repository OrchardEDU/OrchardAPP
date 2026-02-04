import { pool } from '../connection.js';

/**
 * Get user by ID
 */
export async function getUserById(userId) {
	const result = await pool.query(
		'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
		[userId]
	);
	return result.rows[0] || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
	const result = await pool.query(
		'SELECT * FROM users WHERE email = $1',
		[email]
	);
	return result.rows[0] || null;
}

/**
 * Create a new user
 */
export async function createUser(email, passwordHash, name, role) {
	const result = await pool.query(
		`INSERT INTO users (email, password_hash, name, role)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, email, name, role, created_at, updated_at`,
		[email, passwordHash, name, role]
	);
	return result.rows[0];
}

/**
 * Check if email exists
 */
export async function emailExists(email) {
	const result = await pool.query(
		'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
		[email]
	);
	return result.rows[0].exists;
}
