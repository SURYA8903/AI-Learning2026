const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // Student & Course Reference
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    courseName: {
      type: String,
      required: true,
    },

    // Order Information
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    orderNotes: String,

    // Payment Gateway Information
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal'],
      required: true,
    },
    paymentId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Amount Information
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
    },
    discountApplied: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment Method
    paymentMethod: {
      method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'emi'],
        default: null,
      },
      details: {
        cardBrand: String, // visa, mastercard, amex
        cardLastFour: String,
        bankName: String,
        walletProvider: String,
      },
    },

    // Payment Status
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    statusReason: {
      type: String,
      default: null,
    },

    // Timestamps
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },

    // Refund Information
    refund: {
      isRefunded: { type: Boolean, default: false },
      refundAmount: { type: Number, default: 0 },
      refundId: String,
      refundReason: String,
      refundedAt: Date,
      refundStatus: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: null,
      },
    },

    // Metadata
    metadata: {
      ipAddress: String,
      userAgent: String,
      deviceInfo: String,
      referrer: String,
    },

    // Invoice
    invoice: {
      invoiceNumber: String,
      invoicePath: String,
      invoiceSentAt: Date,
    },

    // Retry Information
    retryCount: {
      type: Number,
      default: 0,
      max: 3,
    },
    lastRetryAt: Date,

    // Notes
    adminNotes: String,
    failureDetails: {
      errorCode: String,
      errorMessage: String,
      gatewayResponse: mongoose.Schema.Types.Mixed,
    },

    // Webhook Information
    webhookVerified: {
      type: Boolean,
      default: false,
    },
    webhookReceivedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
paymentSchema.index({ studentId: 1, courseId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paidAt: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ studentEmail: 1 });

// Virtual for amount with currency
paymentSchema.virtual('amountWithCurrency').get(function () {
  const symbols = { INR: '₹', USD: '$', EUR: '€' };
  return `${symbols[this.currency] || this.currency} ${this.finalAmount}`;
});

// Virtual for payment success status
paymentSchema.virtual('isSuccessful').get(function () {
  return this.status === 'completed';
});

// Virtual for payment pending status
paymentSchema.virtual('isPending').get(function () {
  return this.status === 'pending' || this.status === 'processing';
});

// Method to mark payment as completed
paymentSchema.methods.markAsCompleted = function () {
  this.status = 'completed';
  this.completedAt = new Date();
  this.webhookVerified = true;
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function (errorCode, errorMessage) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureDetails = {
    errorCode,
    errorMessage,
    gatewayResponse: null,
  };
  this.statusReason = errorMessage;
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = async function (refundAmount, reason) {
  this.refund.isRefunded = true;
  this.refund.refundAmount = refundAmount || this.finalAmount;
  this.refund.refundReason = reason;
  this.refund.refundedAt = new Date();
  this.refund.refundStatus = 'pending';
  this.status = 'refunded';
  return this.save();
};

// Method to increment retry count
paymentSchema.methods.incrementRetry = function () {
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  return this.save();
};

// Static method to get payment stats
paymentSchema.statics.getPaymentStats = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$currency',
        totalAmount: { $sum: '$finalAmount' },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$finalAmount' },
      },
    },
  ]);
};

// Static method to get daily revenue
paymentSchema.statics.getDailyRevenue = async function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue: { $sum: '$finalAmount' },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
