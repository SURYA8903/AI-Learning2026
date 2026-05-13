/**
 * Application Constants
 */

module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  },

  // Enrollment Status
  ENROLLMENT_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CERTIFICATE_ISSUED: 'certificate_issued',
  },

  // Certificate Status
  CERTIFICATE_STATUS: {
    ISSUED: 'issued',
    REVOKED: 'revoked',
    EXPIRED: 'expired',
  },

  // User Roles
  USER_ROLES: {
    STUDENT: 'student',
    TRAINER: 'trainer',
    ADMIN: 'admin',
  },

  // Payment Methods
  PAYMENT_METHODS: {
    CARD: 'card',
    UPI: 'upi',
    NETBANKING: 'netbanking',
    WALLET: 'wallet',
    EMI: 'emi',
  },

  // Payment Gateways
  PAYMENT_GATEWAYS: {
    RAZORPAY: 'razorpay',
    STRIPE: 'stripe',
    PAYPAL: 'paypal',
  },

  // Course Categories
  COURSE_CATEGORIES: {
    PROGRAMMING: 'programming',
    WEB: 'web',
    MOBILE: 'mobile',
    DATA_SCIENCE: 'data-science',
    AI_ML: 'ai-ml',
    DEVOPS: 'devops',
    OTHER: 'other',
  },

  // Course Levels
  COURSE_LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
  },

  // Email Templates
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    PAYMENT_RECEIPT: 'payment_receipt',
    CERTIFICATE: 'certificate',
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'password_reset',
    REMINDER: 'reminder',
  },

  // Error Messages
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_LOCKED: 'Account is locked due to multiple failed attempts',
    STUDENT_NOT_FOUND: 'Student not found',
    COURSE_NOT_FOUND: 'Course not found',
    PAYMENT_NOT_FOUND: 'Payment not found',
    CERTIFICATE_NOT_FOUND: 'Certificate not found',
    ALREADY_ENROLLED: 'Student is already enrolled in this course',
    INSUFFICIENT_PROGRESS: 'Student has not completed course requirements',
    UNAUTHORIZED_ACCESS: 'You are not authorized to access this resource',
    INVALID_TOKEN: 'Token is invalid or expired',
    CERTIFICATE_ALREADY_ISSUED: 'Certificate already issued for this course',
    REFUND_WINDOW_EXPIRED: 'Refund window has expired',
    PAYMENT_VERIFICATION_FAILED: 'Payment verification failed',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    ENROLLED_SUCCESSFULLY: 'Enrolled successfully',
    PAYMENT_SUCCESSFUL: 'Payment successful',
    CERTIFICATE_GENERATED: 'Certificate generated successfully',
    EMAIL_SENT: 'Email sent successfully',
    STATUS_UPDATED: 'Status updated successfully',
    REFUND_PROCESSED: 'Refund processed successfully',
  },

  // Limits
  LIMITS: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCK_TIME_MINUTES: 30,
    PASSWORD_RESET_EXPIRY_HOURS: 1,
    VERIFICATION_TOKEN_EXPIRY_HOURS: 24,
    JWT_EXPIRY_DAYS: 7,
    REFRESH_TOKEN_EXPIRY_DAYS: 30,
    REFUND_ALLOWED_DAYS: 30,
    MIN_COMPLETION_PERCENTAGE: 80,
    PASSWORD_MIN_LENGTH: 6,
    PAGE_LIMIT: 50,
    RATE_LIMIT_WINDOW_MINUTES: 15,
    RATE_LIMIT_MAX_REQUESTS: 100,
  },

  // Certificates
  CERTIFICATES: {
    ID_PREFIX: 'CERT',
    VALIDITY_YEARS: 1,
    DEFAULT_GRADE: 'Distinction',
    DEFAULT_SCORE: 100,
  },

  // Regex Patterns
  PATTERNS: {
    EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    PHONE_INDIA: /^[6-9]\d{9}$/,
    PHONE_INTERNATIONAL: /^\+?1?\d{9,15}$/,
    URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&/=]*)$/,
  },

  // API
  API: {
    VERSION: 'v1',
    BASE_PATH: '/api',
    TIMEOUT_MS: 30000,
  },

  // Database
  DATABASE: {
    RETRY_ATTEMPTS: 5,
    RETRY_DELAY_MS: 5000,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Time
  TIME: {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
  },
};
