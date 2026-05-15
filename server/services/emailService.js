const nodemailer = require('nodemailer');
const path = require('path');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter
   */
  async initialize() {
    try {
      if (this.initialized) return;

      const emailConfig = {
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_SMTP_HOST,
        port: process.env.EMAIL_SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      };

      this.transporter = nodemailer.createTransport(emailConfig);

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * Send enrollment confirmation email
   * @param {Object} data - Email data
   */
  async sendEnrollmentConfirmation(data) {
    try {
      if (!this.initialized) await this.initialize();

      const { studentEmail, studentName, courseName, courseId } = data;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to ${courseName}! 🎓</h2>
          <p>Dear ${studentName},</p>
          <p>Congratulations on enrolling in <strong>${courseName}</strong>!</p>
          <p>Your enrollment has been confirmed. You can now:</p>
          <ul style="color: #666;">
            <li>Access all course materials</li>
            <li>Watch video lessons</li>
            <li>Submit assignments</li>
            <li>Participate in discussions</li>
          </ul>
          <p>
            <a href="${process.env.CLIENT_REDIRECT_URL}/courses/${courseId}" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Start Learning Now
            </a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Welcome to ${courseName}!`,
        html: htmlContent,
      });

      logger.info(`Enrollment confirmation sent to ${studentEmail}`);
    } catch (error) {
      logger.error('Error sending enrollment email:', error);
      throw error;
    }
  }

  /**
   * Send payment receipt email
   * @param {Object} data - Email data
   */
  async sendPaymentReceipt(data) {
    try {
      if (!this.initialized) await this.initialize();

      const { studentEmail, studentName, courseName, amount, orderId, transactionId } = data;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Receipt</h2>
          <p>Dear ${studentName},</p>
          <p>Thank you for your payment! Your transaction has been completed successfully.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
          <p>You can now access all course materials. Click below to start learning:</p>
          <p>
            <a href="${process.env.CLIENT_REDIRECT_URL}/dashboard" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: 'Payment Receipt - E-Learning Platform',
        html: htmlContent,
      });

      logger.info(`Payment receipt sent to ${studentEmail}`);
    } catch (error) {
      logger.error('Error sending receipt email:', error);
      throw error;
    }
  }

  /**
   * Send certificate email
   * @param {Object} data - Email data
   */
  async sendCertificateEmail(data) {
    try {
      if (!this.initialized) await this.initialize();

      const {
        studentEmail,
        studentName,
        courseName,
        certificateId,
        certificateUrl,
        issuedDate,
      } = data;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🎉 Congratulations!</h2>
          <p>Dear ${studentName},</p>
          <p>We are delighted to inform you that you have successfully completed <strong>${courseName}</strong>!</p>
          <p>Your certificate of completion has been issued and is ready for download.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Certificate ID:</strong> ${certificateId}</p>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Issued Date:</strong> ${new Date(issuedDate).toLocaleDateString('en-IN')}</p>
          </div>
          <p>
            <a href="${certificateUrl}" 
               style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Download Certificate
            </a>
          </p>
          <p style="color: #666; margin-top: 30px;">
            You can also view and share your certificate from your dashboard.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This certificate is valid and can be shared with potential employers or used for professional development.
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Your Certificate for ${courseName} is Ready!`,
        html: htmlContent,
      });

      logger.info(`Certificate email sent to ${studentEmail}`);
    } catch (error) {
      logger.error('Error sending certificate email:', error);
      throw error;
    }
  }

  /**
   * Send verification email
   * @param {string} email - Student email
   * @param {string} token - Verification token
   */
  async sendVerificationEmail(email, token) {
    try {
      if (!this.initialized) await this.initialize();

      const verificationLink = `${process.env.CLIENT_REDIRECT_URL}/verify-email?token=${token}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your Email Address</h2>
          <p>Thank you for signing up with E-Learning Platform!</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p style="margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 24 hours. If you didn't create this account, please ignore this email.
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - E-Learning Platform',
        html: htmlContent,
      });

      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - Student email
   * @param {string} token - Reset token
   */
  async sendPasswordResetEmail(email, token) {
    try {
      if (!this.initialized) await this.initialize();

      const resetLink = `${process.env.CLIENT_REDIRECT_URL}/reset-password?token=${token}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the link below to create a new password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset - E-Learning Platform',
        html: htmlContent,
      });

      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send course progress reminder
   * @param {Object} data - Email data
   */
  async sendCourseReminder(data) {
    try {
      if (!this.initialized) await this.initialize();

      const { studentEmail, studentName, courseName, progress, nextLesson } = data;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Continue Your Learning Journey! 📚</h2>
          <p>Hi ${studentName},</p>
          <p>We noticed you haven't completed <strong>${courseName}</strong> yet.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Your Progress:</strong> ${progress}%</p>
            <p><strong>Next Lesson:</strong> ${nextLesson}</p>
          </div>
          <p>Keep up the momentum! You're doing great.</p>
          <p>
            <a href="${process.env.CLIENT_REDIRECT_URL}/dashboard" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Continue Learning
            </a>
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Continue ${courseName} - ${progress}% Complete`,
        html: htmlContent,
      });

      logger.info(`Course reminder sent to ${studentEmail}`);
    } catch (error) {
      logger.error('Error sending course reminder:', error);
      throw error;
    }
  }

  /**
   * Send bulk email
   * @param {Array<string>} recipients - Email addresses
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content
   */
  async sendBulkEmail(recipients, subject, htmlContent) {
    try {
      if (!this.initialized) await this.initialize();

      const results = [];

      for (const email of recipients) {
        try {
          await this.transporter.sendMail({
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent,
          });
          results.push({ email, success: true });
        } catch (error) {
          logger.error(`Error sending email to ${email}:`, error);
          results.push({ email, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error sending bulk emails:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
