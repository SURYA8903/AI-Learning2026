const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const certificateController = require('../controllers/certificateController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');

// ============ PAYMENT ROUTES ============

/**
 * Create order
 * POST /api/payment/create-order
 * Protected - Student
 */
router.post('/create-order', protect, paymentController.createOrder);

/**
 * Verify payment
 * POST /api/payment/verify
 * Public - Razorpay response
 */
router.post('/verify', paymentController.verifyPayment);

/**
 * Payment webhook
 * POST /api/payment/webhook
 * Public - Razorpay webhook
 */
router.post('/webhook', paymentController.paymentWebhook);

/**
 * Get payment history
 * GET /api/payment/history
 * Protected - Student
 */
router.get('/history', protect, paymentController.getPaymentHistory);

/**
 * Request refund
 * POST /api/payment/refund
 * Protected - Student
 */
router.post('/refund', protect, paymentController.requestRefund);

/**
 * Check course access
 * GET /api/payment/check-access/:courseId
 * Protected - Student
 */
router.get('/check-access/:courseId', protect, paymentController.checkCourseAccess);

// ============ CERTIFICATE ROUTES ============

/**
 * Generate certificate
 * POST /api/certificate/generate/:studentId/:courseId
 * Protected - Admin
 */
router.post(
  '/certificate/generate/:studentId/:courseId',
  protect,
  authorize('admin', 'trainer'),
  certificateController.generateCertificate
);

/**
 * Get student certificates
 * GET /api/certificate/my-certificates
 * Protected - Student
 */
router.get(
  '/certificate/my-certificates',
  protect,
  certificateController.getStudentCertificates
);

/**
 * Verify certificate
 * GET /api/certificate/verify/:certificateId
 * Public
 */
router.get('/certificate/verify/:certificateId', certificateController.verifyCertificate);

/**
 * Download certificate
 * GET /api/certificate/download/:certificateId
 * Protected or Public (depends on status)
 */
router.get(
  '/certificate/download/:certificateId',
  optionalAuth,
  certificateController.downloadCertificate
);

/**
 * Revoke certificate
 * POST /api/certificate/revoke/:studentId/:certificateId
 * Protected - Admin
 */
router.post(
  '/certificate/revoke/:studentId/:certificateId',
  protect,
  authorize('admin'),
  certificateController.revokeCertificate
);

/**
 * Bulk generate certificates
 * POST /api/certificate/bulk-generate
 * Protected - Admin
 */
router.post(
  '/certificate/bulk-generate',
  protect,
  authorize('admin'),
  certificateController.bulkGenerateCertificates
);

/**
 * Update status and auto-generate certificate
 * PUT /api/certificate/update-status/:studentId/:courseId
 * Protected - Admin
 */
router.put(
  '/certificate/update-status/:studentId/:courseId',
  protect,
  authorize('admin', 'trainer'),
  certificateController.updateStatusAndGenerateCertificate
);

/**
 * Certificate stats
 * GET /api/certificate/stats
 * Protected - Admin
 */
router.get(
  '/certificate/stats',
  protect,
  authorize('admin'),
  certificateController.getCertificateStats
);

module.exports = router;
