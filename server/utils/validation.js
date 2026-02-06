/**
 * Input validation & sanitization helpers
 */

/**
 * Safely normalize a string:
 * - Coerce non-strings to empty
 * - Trim whitespace
 * - Truncate to a safe maximum length
 */
export function sanitizeString(value, maxLength = 255) {
	if (typeof value !== 'string') return '';
	let normalized = value.trim();
	if (normalized.length > maxLength) {
		normalized = normalized.slice(0, maxLength);
	}
	// Optionally strip control characters
	normalized = normalized.replace(/[\x00-\x1F\x7F]/g, '');
	return normalized;
}

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
