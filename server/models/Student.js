const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    profilePicture: {
      type: String,
      default: null,
    },

    // Course Information
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        enrolledDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed', 'certificate_issued'],
          default: 'pending',
        },
        completionDate: {
          type: Date,
          default: null,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],

    // Payment Information
    payments: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        orderId: {
          type: String,
          required: true,
        },
        paymentId: {
          type: String,
          default: null,
        },
        amount: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          default: 'INR',
        },
        paymentMethod: {
          type: String,
          enum: ['razorpay', 'stripe', 'upi', 'card'],
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'completed', 'failed', 'refunded'],
          default: 'pending',
        },
        transactionId: {
          type: String,
          default: null,
        },
        paidAt: {
          type: Date,
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Certificate Information
    certificates: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        certificateId: {
          type: String,
          unique: true,
          required: true,
        },
        googleDocId: {
          type: String,
          default: null,
        },
        pdfUrl: {
          type: String,
          default: null,
        },
        driveFileId: {
          type: String,
          default: null,
        },
        issuedDate: {
          type: Date,
          default: Date.now,
        },
        validUntil: {
          type: Date,
          default: null,
        },
        issuedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Admin',
          default: null,
        },
        status: {
          type: String,
          enum: ['issued', 'revoked', 'expired'],
          default: 'issued',
        },
        emailSentAt: {
          type: Date,
          default: null,
        },
      },
    ],

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },

    // Account Security
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },

    // Preferences
    subscribeToEmails: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'ta', 'te'],
    },

    // Admin Fields
    role: {
      type: String,
      enum: ['student', 'trainer', 'admin'],
      default: 'student',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
studentSchema.index({ email: 1 });
studentSchema.index({ phoneNumber: 1 });
studentSchema.index({ createdAt: -1 });
studentSchema.index({ 'enrolledCourses.courseId': 1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
studentSchema.methods.comparePassword = async function (enteredPassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if account is locked
studentSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > new Date();
};

// Method to increment login attempts
studentSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lock expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { loginAttempts: 1, lockUntil: null },
    });
  }

  // Increment attempts, lock at 5 attempts
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes

  if (this.loginAttempts < maxAttempts) {
    return this.updateOne({ $inc: { loginAttempts: 1 } });
  } else {
    return this.updateOne({
      $inc: { loginAttempts: 1 },
      $set: { lockUntil: new Date(Date.now() + lockTime) },
    });
  }
};

// Method to reset login attempts
studentSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lockUntil: null },
  });
};

// Method to check if payment is completed for course
studentSchema.methods.hasPaymentCompleted = function (courseId) {
  return this.payments.some(
    (p) => p.courseId.toString() === courseId.toString() && p.status === 'completed'
  );
};

// Method to get enrollment status
studentSchema.methods.getEnrollmentStatus = function (courseId) {
  const enrollment = this.enrolledCourses.find(
    (e) => e.courseId.toString() === courseId.toString()
  );
  return enrollment ? enrollment.status : null;
};

module.exports = mongoose.model('Student', studentSchema);
