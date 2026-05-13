const jwt = require('jsonwebtoken');
const logger = require('../services/logger');
const Student = require('../models/Student');

/**
 * Protect route - verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Invalid token attempt:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired',
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Check if user is admin
 */
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized',
        });
      }

      const student = await Student.findById(req.user.id).select('role');

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!roles.includes(student.role)) {
        logger.warn(`Unauthorized access attempt by user ${req.user.id}`);
        return res.status(403).json({
          success: false,
          message: 'User role is not authorized to access this route',
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error',
      });
    }
  };
};

/**
 * Optional auth - attach user if token exists
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (error) {
        logger.debug('Optional auth token invalid:', error.message);
        // Continue without user
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next(); // Continue regardless
  }
};

/**
 * Rate limiting middleware
 */
exports.rateLimiter = (req, res, next) => {
  // You can use express-rate-limit for production
  next();
};
