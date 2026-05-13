const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('./logger');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Course = require('../models/Course');

class PaymentService {
  constructor() {
    try {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      logger.info('Razorpay initialized');
    } catch (error) {
      logger.error('Failed to initialize Razorpay:', error);
      throw error;
    }
  }

  /**
   * Create a payment order
   * @param {string} studentId - Student ID
   * @param {string} courseId - Course ID
   * @param {number} amount - Amount in rupees
   * @returns {Promise<Object>} - Order data
   */
  async createOrder(studentId, courseId, amount) {
    try {
      const student = await Student.findById(studentId);
      const course = await Course.findById(courseId);

      if (!student || !course) {
        throw new Error('Student or Course not found');
      }

      // Check if student already paid for this course
      const existingPayment = await Payment.findOne({
        studentId,
        courseId,
        status: 'completed',
      });

      if (existingPayment) {
        throw new Error('Student has already purchased this course');
      }

      logger.info(
        `Creating Razorpay order for student ${studentId}, course ${courseId}, amount: ${amount}`
      );

      // Create Razorpay order
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${studentId}_${courseId}_${Date.now()}`,
        notes: {
          studentId,
          courseId,
          studentEmail: student.email,
          courseName: course.title,
        },
      };

      const razorpayOrder = await this.razorpay.orders.create(options);

      // Save payment record in database
      const payment = new Payment({
        studentId,
        courseId,
        studentEmail: student.email,
        courseName: course.title,
        orderId: razorpayOrder.id,
        amount,
        currency: 'INR',
        finalAmount: amount,
        paymentGateway: 'razorpay',
        status: 'pending',
      });

      await payment.save();

      logger.info(`Order created successfully: ${razorpayOrder.id}`);

      return {
        orderId: razorpayOrder.id,
        amount,
        currency: 'INR',
        studentName: student.fullName,
        studentEmail: student.email,
        courseName: course.title,
        paymentId: payment._id,
      };
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Verify payment signature
   * @param {Object} paymentData - Payment data with signature
   * @returns {boolean} - Verification result
   */
  verifySignature(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      const isValid = digest === razorpay_signature;

      if (isValid) {
        logger.info(`Payment signature verified: ${razorpay_payment_id}`);
      } else {
        logger.warn(`Payment signature verification failed: ${razorpay_payment_id}`);
      }

      return isValid;
    } catch (error) {
      logger.error('Error verifying signature:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   * @param {Object} paymentData - Payment data from webhook
   * @returns {Promise<Object>} - Updated payment record
   */
  async handlePaymentSuccess(paymentData) {
    try {
      const { razorpay_payment_id, razorpay_order_id } = paymentData;

      logger.info(`Processing successful payment: ${razorpay_payment_id}`);

      // Find payment record
      const payment = await Payment.findOne({ orderId: razorpay_order_id });

      if (!payment) {
        throw new Error(`Payment record not found for order: ${razorpay_order_id}`);
      }

      // Update payment status
      payment.paymentId = razorpay_payment_id;
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.paidAt = new Date();
      payment.webhookVerified = true;

      await payment.save();

      // Update student enrollment
      const student = await Student.findById(payment.studentId);
      const enrollmentIndex = student.enrolledCourses.findIndex(
        (e) => e.courseId.toString() === payment.courseId.toString()
      );

      if (enrollmentIndex === -1) {
        // Create new enrollment
        student.enrolledCourses.push({
          courseId: payment.courseId,
          enrolledDate: new Date(),
          status: 'in_progress',
          progress: 0,
        });
      } else {
        // Update existing enrollment status
        student.enrolledCourses[enrollmentIndex].status = 'in_progress';
      }

      await student.save();

      // Update course stats
      await Course.updateOne(
        { _id: payment.courseId },
        { $inc: { 'stats.totalEnrollments': enrollmentIndex === -1 ? 1 : 0 } }
      );

      logger.info(`Payment processed successfully for student ${payment.studentId}`);

      return payment;
    } catch (error) {
      logger.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} - Updated payment record
   */
  async handlePaymentFailure(paymentData) {
    try {
      const { razorpay_order_id, error_code, error_description } = paymentData;

      logger.warn(
        `Payment failed for order ${razorpay_order_id}: ${error_code} - ${error_description}`
      );

      // Find payment record
      const payment = await Payment.findOne({ orderId: razorpay_order_id });

      if (!payment) {
        throw new Error(`Payment record not found for order: ${razorpay_order_id}`);
      }

      // Update payment status
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.failureDetails = {
        errorCode: error_code,
        errorMessage: error_description,
      };
      payment.statusReason = error_description;

      await payment.save();

      logger.info(`Payment failure recorded for order ${razorpay_order_id}`);

      return payment;
    } catch (error) {
      logger.error('Error handling payment failure:', error);
      throw error;
    }
  }

  /**
   * Process refund
   * @param {string} paymentId - Payment ID (MongoDB)
   * @param {number} amount - Refund amount (optional, full refund if not provided)
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} - Refund result
   */
  async processRefund(paymentId, amount, reason) {
    try {
      logger.info(`Processing refund for payment ${paymentId}, reason: ${reason}`);

      const payment = await Payment.findById(paymentId);

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error(`Cannot refund payment with status: ${payment.status}`);
      }

      if (payment.refund?.isRefunded) {
        throw new Error('Payment has already been refunded');
      }

      const refundAmount = amount || payment.finalAmount;

      if (refundAmount > payment.finalAmount) {
        throw new Error('Refund amount cannot exceed paid amount');
      }

      // Process refund with Razorpay
      const refund = await this.razorpay.payments.refund(payment.paymentId, {
        amount: Math.round(refundAmount * 100), // Convert to paise
        notes: {
          reason,
          processedAt: new Date().toISOString(),
        },
      });

      // Update payment record
      payment.refund.isRefunded = true;
      payment.refund.refundAmount = refundAmount;
      payment.refund.refundId = refund.id;
      payment.refund.refundReason = reason;
      payment.refund.refundedAt = new Date();
      payment.refund.refundStatus = 'processed';
      payment.status = 'refunded';

      await payment.save();

      // Remove enrollment if full refund
      if (refundAmount === payment.finalAmount) {
        const student = await Student.findById(payment.studentId);
        student.enrolledCourses = student.enrolledCourses.filter(
          (e) => e.courseId.toString() !== payment.courseId.toString()
        );
        await student.save();

        logger.info(`Enrollment removed due to full refund`);
      }

      logger.info(`Refund processed successfully: ${refund.id}`);

      return {
        success: true,
        refundId: refund.id,
        refundAmount,
        message: 'Refund processed successfully',
      };
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Get payment details from Razorpay
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise<Object>} - Payment details
   */
  async getPaymentDetails(paymentId) {
    try {
      const details = await this.razorpay.payments.fetch(paymentId);
      return details;
    } catch (error) {
      logger.error('Error fetching payment details:', error);
      throw error;
    }
  }

  /**
   * Get payment history for student
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} - Payment records
   */
  async getStudentPayments(studentId) {
    try {
      const payments = await Payment.find({ studentId })
        .populate('courseId', 'title category')
        .sort({ createdAt: -1 });

      return payments;
    } catch (error) {
      logger.error('Error fetching student payments:', error);
      throw error;
    }
  }

  /**
   * Retry failed payment
   * @param {string} paymentId - Payment ID (MongoDB)
   * @returns {Promise<Object>} - New order for retry
   */
  async retryPayment(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status === 'completed') {
        throw new Error('Payment is already completed');
      }

      if (payment.retryCount >= 3) {
        throw new Error('Maximum retry attempts exceeded');
      }

      logger.info(`Retrying payment ${paymentId}, attempt ${payment.retryCount + 1}`);

      // Create new order
      const newOrder = await this.createOrder(
        payment.studentId,
        payment.courseId,
        payment.amount
      );

      // Update original payment record
      payment.retryCount += 1;
      payment.lastRetryAt = new Date();
      await payment.save();

      return newOrder;
    } catch (error) {
      logger.error('Error retrying payment:', error);
      throw error;
    }
  }

  /**
   * Check if student has paid for course
   * @param {string} studentId - Student ID
   * @param {string} courseId - Course ID
   * @returns {Promise<boolean>} - Payment status
   */
  async hasStudentPaid(studentId, courseId) {
    try {
      const payment = await Payment.findOne({
        studentId,
        courseId,
        status: 'completed',
      });

      return !!payment;
    } catch (error) {
      logger.error('Error checking payment status:', error);
      return false;
    }
  }

  /**
   * Get revenue analytics
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} - Revenue data
   */
  async getRevenueAnalytics(startDate, endDate) {
    try {
      const stats = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$finalAmount' },
            totalTransactions: { $sum: 1 },
            averageTransactionValue: { $avg: '$finalAmount' },
            maxTransaction: { $max: '$finalAmount' },
            minTransaction: { $min: '$finalAmount' },
          },
        },
      ]);

      return stats[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransactionValue: 0,
        maxTransaction: 0,
        minTransaction: 0,
      };
    } catch (error) {
      logger.error('Error getting revenue analytics:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
