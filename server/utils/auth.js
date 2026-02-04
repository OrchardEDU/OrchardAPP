import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password) {
	return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
export async function verifyPassword(password, hash) {
	return await bcrypt.compare(password, hash);
}

/**
 * Remove password hash from user object
 * @param {object} user - User object with password_hash
 * @returns {object} - User object without password_hash
 */
export function sanitizeUser(user) {
	if (!user) return null;
	const { password_hash, ...sanitized } = user;
	return sanitized;
}
