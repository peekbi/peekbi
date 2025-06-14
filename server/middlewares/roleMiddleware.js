const userModel = require('../model/userModel');
/**
 * Scalable role check middleware
 * @param {string[]} allowedRoles - Roles allowed to access the route
 */
const checkRole = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const userId = req.query.userId || req.query.id || req.params.id || req.body.id;


            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User ID is required for role verification',
                });
            }

            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found',
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    status: 'error',
                    message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
                });
            }

            // Optional: attach user to request for downstream use
            req.user = user;

            next(); // Proceed to controller/next middleware
        } catch (err) {
            console.error('Role check failed:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error during role check',
            });
        }
    };
};

module.exports = checkRole;