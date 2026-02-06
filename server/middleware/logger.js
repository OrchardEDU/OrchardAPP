/**
 * Request logging middleware
 * Logs all API requests in format: [session-id]: [METHOD] [path]
 * @param {boolean} enabled - Whether logging is enabled
 */

export const createRequestLogger = (enabled = true) => {
	return (req, res, next) => {
		// Only log if enabled
		if (enabled) {
			// Extract session ID from request (or "no-session" if not authenticated)
			const sessionId = req.sessionID || req.session?.id || 'no-session';
			
			// Capture HTTP method
			const method = req.method;
			
			// Capture full request path including route parameters and query strings
			let path = req.originalUrl || req.url;
			
			// Format log as: [session-id]: [METHOD] [path]
			const logMessage = `[${sessionId}]: ${method} ${path}`;
			
			// Log before request processing
			console.log(logMessage);
		}
		
		// Continue to next middleware
		next();
	};
};

// Export default for backward compatibility
export const requestLogger = createRequestLogger(true);
