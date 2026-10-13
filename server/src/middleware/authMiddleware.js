// Auth middleware — decrypts JWT from httpOnly cookie and attaches user to req.
// Uses authService.getUserById so the service stays the single source of truth.
// Theme: Virtual Identity.
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await authService.getUserById(decoded.id);
    next();
  } catch (err) {
    // Preserve ApiError status if the service threw one
    return res.status(err.statusCode || 401).json({
      message: err.message || 'Invalid or expired token',
    });
  }
};

module.exports = { protect };