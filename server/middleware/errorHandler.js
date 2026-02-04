/**
 * Centralized error handling middleware
 */

export const errorHandler = (err, req, res, next) => {
	console.error('Error:', err);

	// Default error response
	const status = err.status || err.statusCode || 500;
	const message = err.message || 'Internal server error';

	// Don't expose internal error details to clients
	res.status(status).json({
		success: false,
		message: status === 500 ? 'Internal server error' : message,
		...(process.env.NODE_ENV === 'development' && { error: err.message }),
	});
};
