const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    // Course Information
    title: {
      type: String,
      required: [true, 'Course title is required'],
      unique: true,
      trim: true,
      minlength: 5,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      minlength: 20,
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['programming', 'web', 'mobile', 'data-science', 'ai-ml', 'devops', 'other'],
    },
    tags: [String],
    thumbnail: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },

    // Course Details
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    duration: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ['weeks', 'months'], default: 'weeks' },
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalModules: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'English',
    },

    // Pricing Information
    pricing: {
      isFree: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR'],
      },
      discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      discountValidUntil: {
        type: Date,
        default: null,
      },
      originalPrice: {
        type: Number,
        default: 0,
      },
      // Dynamic pricing strategy
      pricingTier: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        default: 'standard',
      },
      refundPolicy: {
        allowRefund: { type: Boolean, default: true },
        refundDays: { type: Number, default: 30 },
      },
    },

    // Certificate Configuration
    certificate: {
      isEnabled: {
        type: Boolean,
        default: true,
      },
      template: {
        googleDocId: {
          type: String,
          default: null,
        },
        templateName: {
          type: String,
          default: 'Standard Certificate',
        },
      },
      criteriaToIssue: {
        minCompletionPercentage: {
          type: Number,
          default: 80,
          min: 0,
          max: 100,
        },
        passingScore: {
          type: Number,
          default: 60,
          min: 0,
          max: 100,
        },
        requireAssignmentSubmission: {
          type: Boolean,
          default: true,
        },
        requireQuizCompletion: {
          type: Boolean,
          default: true,
        },
      },
      validityPeriod: {
        years: { type: Number, default: 1 },
        isLifetime: { type: Boolean, default: false },
      },
    },

    // Content
    content: {
      modules: [
        {
          moduleId: String,
          title: String,
          lessons: [String],
          duration: Number,
        },
      ],
      resources: [
        {
          resourceId: String,
          title: String,
          type: String, // 'pdf', 'video', 'document'
          url: String,
        },
      ],
    },

    // Requirements & Learning Outcomes
    prerequisites: [String],
    learningOutcomes: [String],
    requirements: [String],

    // Instructor
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    instructorName: String,
    instructorBio: String,
    instructorAvatar: String,

    // Statistics
    stats: {
      totalEnrollments: { type: Number, default: 0 },
      totalCompletions: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      certificatesIssued: { type: Number, default: 0 },
    },

    // Capacity & Availability
    maxEnrollments: {
      type: Number,
      default: null, // null = unlimited
    },
    enrollmentDeadline: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedDate: {
      type: Date,
      default: null,
    },

    // SEO
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // Additional Features
    hasQuiz: { type: Boolean, default: false },
    hasAssignments: { type: Boolean, default: false },
    hasProjects: { type: Boolean, default: false },
    supportLiveChat: { type: Boolean, default: true },
    supportForums: { type: Boolean, default: true },

    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'discontinued'],
      default: 'draft',
    },

    // Admin Fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ createdAt: -1 });

// Virtual for discounted price
courseSchema.virtual('discountedPrice').get(function () {
  if (this.pricing.isFree) return 0;
  if (this.pricing.discountPercentage > 0) {
    return Math.round(this.pricing.amount * (1 - this.pricing.discountPercentage / 100));
  }
  return this.pricing.amount;
});

// Virtual for discount status
courseSchema.virtual('isDiscounted').get(function () {
  return (
    this.pricing.discountPercentage > 0 &&
    (!this.pricing.discountValidUntil || this.pricing.discountValidUntil > new Date())
  );
});

// Method to calculate total course content
courseSchema.methods.calculateDuration = function () {
  if (this.content.modules && this.content.modules.length > 0) {
    const totalMinutes = this.content.modules.reduce((sum, module) => sum + (module.duration || 0), 0);
    return {
      value: Math.ceil(totalMinutes / 60),
      unit: 'hours',
    };
  }
  return this.duration;
};

// Method to check if course can be enrolled
courseSchema.methods.canEnroll = function () {
  if (!this.isPublished || this.status !== 'published') return false;
  if (this.maxEnrollments && this.stats.totalEnrollments >= this.maxEnrollments) return false;
  if (this.enrollmentDeadline && this.enrollmentDeadline < new Date()) return false;
  return true;
};

// Method to get course price with discount
courseSchema.methods.getCurrentPrice = function () {
  if (this.pricing.isFree) return 0;
  return this.discountedPrice;
};

// Pre-save middleware
courseSchema.pre('save', function (next) {
  // Generate slug from title if not provided
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Set original price when discount is applied
  if (this.pricing.discountPercentage > 0 && !this.pricing.originalPrice) {
    this.pricing.originalPrice = this.pricing.amount;
  }

  next();
});

module.exports = mongoose.model('Course', courseSchema);
