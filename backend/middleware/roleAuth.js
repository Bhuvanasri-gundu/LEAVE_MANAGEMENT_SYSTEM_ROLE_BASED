/**
 * Role Authorization Middleware
 * 
 * HOW IT WORKS:
 * - Used AFTER the `protect` middleware (so req.user exists)
 * - Takes a list of allowed roles, e.g. authorize('Admin', 'Manager')
 * - If the user's role is NOT in the list → 403 Forbidden
 * 
 * USAGE IN ROUTES:
 *   router.get('/admin-only', protect, authorize('Admin'), controller);
 *   router.get('/managers-too', protect, authorize('Admin', 'Manager'), controller);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

module.exports = { authorize };
