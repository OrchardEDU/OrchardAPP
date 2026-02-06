/**
 * Authentication middleware
 * Validates session and attaches user to request
 */

/**
 * Middleware to require authentication
 * Attaches user to req.user if authenticated
 */
export const requireAuth = async (req, res, next) => {
	try {
		// Check if session exists
		if (!req.session || !req.session.userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized',
			});
		}

		// User is authenticated, continue
		next();
	} catch (error) {
		console.error('Auth middleware error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

/**
 * Middleware to require specific role
 * @param {string|string[]} roles - Required role(s)
 */
export const requireRole = (roles) => {
	const allowedRoles = Array.isArray(roles) ? roles : [roles];
	
	return async (req, res, next) => {
		try {
			if (!req.session || !req.session.userId || !req.session.role) {
				return res.status(401).json({
					success: false,
					message: 'Unauthorized',
				});
			}

			if (!allowedRoles.includes(req.session.role)) {
				return res.status(403).json({
					success: false,
					message: 'Forbidden',
				});
			}

			next();
		} catch (error) {
			console.error('Role middleware error:', error);
			return res.status(500).json({
				success: false,
				message: 'Internal server error',
			});
		}
	};
};
