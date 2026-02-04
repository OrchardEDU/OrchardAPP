/**
 * Input validation helpers
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
	if (!email || typeof email !== 'string') return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid
 */
export function isValidPassword(password) {
	if (!password || typeof password !== 'string') return false;
	// Minimum 6 characters
	return password.length >= 6;
}

/**
 * Validate role
 * @param {string} role - Role to validate
 * @returns {boolean} - True if valid
 */
export function isValidRole(role) {
	return role === 'student' || role === 'teacher';
}

/**
 * Validate UUID format
 * @param {string} id - UUID to validate
 * @returns {boolean} - True if valid UUID format
 */
export function isValidUUID(id) {
	if (!id || typeof id !== 'string') return false;
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
}
