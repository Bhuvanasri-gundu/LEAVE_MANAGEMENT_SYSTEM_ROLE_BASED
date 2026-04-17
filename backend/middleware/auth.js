const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Auth Middleware
 * 
 * HOW IT WORKS:
 * 1. Client sends a request with header: Authorization: Bearer <token>
 * 2. This middleware extracts the token
 * 3. Verifies it using JWT_SECRET
 * 4. Finds the user in the database
 * 5. Attaches the user object to req.user
 * 6. If anything fails → 401 Unauthorized
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token: "Bearer abc123" → "abc123"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token payload (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next(); // Continue to the next middleware/route
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
