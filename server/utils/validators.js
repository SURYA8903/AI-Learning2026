/**
 * Validation Utilities
 * Common validation functions for API inputs
 */

const PATTERNS = require('./constants').PATTERNS;

/**
 * Validate email
 */
const validateEmail = (email) => {
  return PATTERNS.EMAIL.test(email);
};

/**
 * Validate phone number (Indian)
 */
const validatePhone = (phone, isIndian = true) => {
  if (isIndian) {
    return PATTERNS.PHONE_INDIA.test(phone);
  }
  return PATTERNS.PHONE_INTERNATIONAL.test(phone);
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate URL
 */
const validateUrl = (url) => {
  return PATTERNS.URL.test(url);
};

/**
 * Validate amount (price)
 */
const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0;
};

/**
 * Validate pagination
 */
const validatePage = (page) => {
  const num = parseInt(page);
  return !isNaN(num) && num >= 1;
};

const validateLimit = (limit, max = 100) => {
  const num = parseInt(limit);
  return !isNaN(num) && num >= 1 && num <= max;
};

/**
 * Validate object ID (MongoDB ObjectId format)
 */
const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  return typeof str === 'string'
    ? str.trim().replace(/[<>]/g, '')
    : '';
};

/**
 * Validate student data
 */
const validateStudentData = (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!validatePhone(data.phoneNumber)) {
    errors.push('Invalid phone number');
  }

  if (data.password && validatePassword(data.password).errors.length > 0) {
    errors.push('Password does not meet complexity requirements');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate course data
 */
const validateCourseData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length < 5) {
    errors.push('Course title must be at least 5 characters');
  }

  if (!data.description || data.description.trim().length < 20) {
    errors.push('Course description must be at least 20 characters');
  }

  if (data.pricing && data.pricing.amount && !validateAmount(data.pricing.amount)) {
    errors.push('Invalid course price');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate payment data
 */
const validatePaymentData = (data) => {
  const errors = [];

  if (!validateObjectId(data.studentId)) {
    errors.push('Invalid student ID');
  }

  if (!validateObjectId(data.courseId)) {
    errors.push('Invalid course ID');
  }

  if (!validateEmail(data.studentEmail)) {
    errors.push('Invalid student email');
  }

  if (!validateAmount(data.amount)) {
    errors.push('Invalid payment amount');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate status value
 */
const validateStatus = (status, allowedStatuses) => {
  return allowedStatuses.includes(status);
};

/**
 * Validate percentage (0-100)
 */
const validatePercentage = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateUrl,
  validateAmount,
  validatePage,
  validateLimit,
  validateObjectId,
  sanitizeString,
  validateStudentData,
  validateCourseData,
  validatePaymentData,
  validateStatus,
  validatePercentage,
};
