/**
 * Error Handler Utility
 * Handles all types of errors with proper logging and formatting
 */

const logger = require('../services/logger');
const { HTTP_STATUS, ERROR_MESSAGES } = require('./constants');

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle validation error
 */
const handleValidationError = (errors) => {
  const message = Array.isArray(errors)
    ? errors.join(', ')
    : errors;
  throw new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle authentication error
 */
const handleAuthenticationError = (message = 'Authentication failed') => {
  throw new AppError(message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Handle authorization error
 */
const handleAuthorizationError = (message = 'You are not authorized to access this resource') => {
  throw new AppError(message, HTTP_STATUS.FORBIDDEN);
};

/**
 * Handle not found error
 */
const handleNotFoundError = (resource = 'Resource') => {
  throw new AppError(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
};

/**
 * Handle conflict error
 */
const handleConflictError = (message) => {
  throw new AppError(message, HTTP_STATUS.CONFLICT);
};

/**
 * Handle payment error
 */
const handlePaymentError = (message = 'Payment processing failed') => {
  throw new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle certificate error
 */
const handleCertificateError = (message = 'Certificate generation failed') => {
  throw new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle email error
 */
const handleEmailError = (message = 'Email sending failed') => {
  logger.error('Email error:', message);
  // Don't throw, email errors are non-critical
  return false;
};

/**
 * Handle database error
 */
const handleDatabaseError = (error) => {
  logger.error('Database error:', error);

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    throw new AppError(`${field} already exists`, HTTP_STATUS.CONFLICT);
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    throw new AppError(messages.join(', '), HTTP_STATUS.BAD_REQUEST);
  }

  throw new AppError('Database operation failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

/**
 * Handle external API error
 */
const handleApiError = (error, apiName) => {
  logger.error(`${apiName} API error:`, error);

  if (error.status === 401 || error.status === 403) {
    throw new AppError(`${apiName} authentication failed`, HTTP_STATUS.BAD_REQUEST);
  }

  if (error.status === 404) {
    throw new AppError(`${apiName} resource not found`, HTTP_STATUS.NOT_FOUND);
  }

  throw new AppError(`${apiName} operation failed`, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Global error handler middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Log error
  logger.error('Global error handler:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
  });

  // Handle operational errors (expected)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  // Handle programming errors (unexpected)
  logger.error('Unhandled error:', err);
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Try-catch wrapper for service functions
 */
const tryCatch = async (fn, defaultValue = null) => {
  try {
    return await fn();
  } catch (error) {
    logger.error('Try-catch error:', error);
    return defaultValue;
  }
};

module.exports = {
  AppError,
  handleValidationError,
  handleAuthenticationError,
  handleAuthorizationError,
  handleNotFoundError,
  handleConflictError,
  handlePaymentError,
  handleCertificateError,
  handleEmailError,
  handleDatabaseError,
  handleApiError,
  globalErrorHandler,
  asyncHandler,
  tryCatch,
};
