/**
 * API Response Formatter
 * Provides consistent response format across all endpoints
 */

const logger = require('../services/logger');

/**
 * Format success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted response
 */
const sendSuccess = (data = null, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error details
 * @returns {Object} Formatted response
 */
const sendError = (message = 'Error', statusCode = 500, error = null) => {
  return {
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && error && { error }),
  };
};

/**
 * Send success response from Express controller
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = sendSuccess(data, message, statusCode);
  logger.info(`Success: ${statusCode} - ${message}`);
  return res.status(statusCode).json(response);
};

/**
 * Send error response from Express controller
 */
const errorResponse = (res, message = 'Error', statusCode = 500, error = null) => {
  const response = sendError(message, statusCode, error);
  logger.error(`Error: ${statusCode} - ${message}`, error);
  return res.status(statusCode).json(response);
};

/**
 * Validate pagination parameters
 */
const validatePagination = (page, limit, maxLimit = 100) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(maxLimit, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, skip };
};

/**
 * Format paginated response
 */
const paginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalPages,
      totalItems: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  sendSuccess,
  sendError,
  successResponse,
  errorResponse,
  validatePagination,
  paginatedResponse,
};
