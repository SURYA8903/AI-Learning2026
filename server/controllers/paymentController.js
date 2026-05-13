const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const certificateService = require('../services/certificateService');
const logger = require('../services/logger');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Course = require('../models/Course');

/**
 * CREATE PAYMENT ORDER
 * POST /api/payment/create-order
 */
exports.createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    // Validation
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    // Check if student is already enrolled
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if course is free
    if (course.pricing.isFree) {
      // Auto-enroll for free course
      const existingEnrollment = student.enrolledCourses.find(
        (e) => e.courseId.toString() === courseId
      );

      if (!existingEnrollment) {
        student.enrolledCourses.push({
          courseId,
          enrolledDate: new Date(),
          status: 'in_progress',
          progress: 0,
        });
        await student.save();

        // Create free payment record
        const payment = new Payment({
          studentId,
          courseId,
          studentEmail: student.email,
          courseName: course.title,
          orderId: `free_${studentId}_${courseId}_${Date.now()}`,
          amount: 0,
          currency: 'INR',
          finalAmount: 0,
          paymentGateway: 'free',
          status: 'completed',
          completedAt: new Date(),
          paidAt: new Date(),
        });
        await payment.save();

        // Send enrollment confirmation
        await emailService.sendEnrollmentConfirmation({
          studentEmail: student.email,
          studentName: student.fullName,
          courseName: course.title,
          courseId,
        });

        logger.info(`Student ${studentId} enrolled in free course ${courseId}`);
      }

      return res.status(200).json({
        success: true,
        message: 'Enrolled in free course successfully',
        data: {
          courseId,
          isFree: true,
        },
      });
    }

    // Check if already purchased
    const hasPaid = await paymentService.hasStudentPaid(studentId, courseId);
    if (hasPaid) {
      return res.status(400).json({
        success: false,
        message: 'You have already purchased this course',
      });
    }

    // Check if course can be enrolled
    if (!course.canEnroll()) {
      return res.status(400).json({
        success: false,
        message: 'This course is not available for enrollment',
      });
    }

    // Calculate final amount
    const finalAmount = course.getCurrentPrice();

    // Create payment order
    const order = await paymentService.createOrder(studentId, courseId, finalAmount);

    logger.info(`Order created for student ${studentId}: ${order.orderId}`);

    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

/**
 * VERIFY PAYMENT
 * POST /api/payment/verify
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Validation
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data',
      });
    }

    // Verify signature
    const isValid = paymentService.verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed',
      });
    }

    // Handle payment success
    const payment = await paymentService.handlePaymentSuccess({
      razorpay_payment_id,
      razorpay_order_id,
    });

    // Get student and course details
    const student = await Student.findById(payment.studentId);
    const course = await Course.findById(payment.courseId);

    // Send confirmation emails
    await emailService.sendPaymentReceipt({
      studentEmail: student.email,
      studentName: student.fullName,
      courseName: course.title,
      amount: payment.amount,
      orderId: payment.orderId,
      transactionId: payment.paymentId,
    });

    await emailService.sendEnrollmentConfirmation({
      studentEmail: student.email,
      studentName: student.fullName,
      courseName: course.title,
      courseId: payment.courseId,
    });

    logger.info(`Payment verified for student ${payment.studentId}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment._id,
        orderId: payment.orderId,
        status: payment.status,
        courseName: course.title,
      },
    });
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

/**
 * GET PAYMENT HISTORY
 * GET /api/payment/history
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user.id;

    const payments = await paymentService.getStudentPayments(studentId);

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved',
      data: payments,
    });
  } catch (error) {
    logger.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
};

/**
 * REQUEST REFUND
 * POST /api/payment/refund
 */
exports.requestRefund = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const studentId = req.user.id;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    // Verify payment belongs to student
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.studentId.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to refund this payment',
      });
    }

    // Check refund eligibility
    const refundPolicy = payment.courseId.pricing?.refundPolicy;
    if (!refundPolicy?.allowRefund) {
      return res.status(400).json({
        success: false,
        message: 'Refunds are not allowed for this course',
      });
    }

    const daysPassed = Math.floor((Date.now() - payment.paidAt) / (1000 * 60 * 60 * 24));
    if (daysPassed > refundPolicy.refundDays) {
      return res.status(400).json({
        success: false,
        message: `Refund window has expired. Refunds allowed within ${refundPolicy.refundDays} days of purchase.`,
      });
    }

    // Process refund
    const refundResult = await paymentService.processRefund(paymentId, null, reason || 'Requested by student');

    logger.info(`Refund processed for payment ${paymentId}`);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: refundResult,
    });
  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};

/**
 * WEBHOOK - RAZORPAY PAYMENT CALLBACK
 * POST /api/payment/webhook
 */
exports.paymentWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!signature && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    logger.info(`Webhook received: ${event}`);

    switch (event) {
      case 'payment.authorized':
        // Payment authorized
        logger.info(`Payment authorized: ${payload.payment.id}`);
        break;

      case 'payment.failed':
        // Payment failed
        await paymentService.handlePaymentFailure({
          razorpay_order_id: payload.payment.order_id,
          error_code: payload.payment.error_code,
          error_description: payload.payment.error_description,
        });
        break;

      case 'refund.created':
        // Refund initiated
        logger.info(`Refund created: ${payload.refund.id}`);
        break;

      default:
        logger.warn(`Unknown webhook event: ${event}`);
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

/**
 * CHECK COURSE ACCESS
 * GET /api/payment/check-access/:courseId
 */
exports.checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if free course
    if (course.pricing.isFree) {
      return res.status(200).json({
        success: true,
        data: {
          hasAccess: true,
          reason: 'free_course',
        },
      });
    }

    // Check if student has paid
    const hasAccess = await paymentService.hasStudentPaid(studentId, courseId);

    res.status(200).json({
      success: true,
      data: {
        hasAccess,
        coursePrice: course.getCurrentPrice(),
        courseName: course.title,
      },
    });
  } catch (error) {
    logger.error('Error checking course access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check course access',
      error: error.message,
    });
  }
};
