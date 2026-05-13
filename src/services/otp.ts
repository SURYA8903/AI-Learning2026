import nodemailer from 'nodemailer';

/**
 * OTP Service for email-based two-factor authentication
 */

const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;

// In-memory OTP storage (for development/testing)
// In production, use Redis or database
const otpStore: {
  [key: string]: {
    code: string;
    timestamp: number;
    attempts: number;
    verified: boolean;
  };
} = {};

/**
 * Generate a random OTP code
 */
export function generateOTP(length: number = OTP_LENGTH): string {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1))
  ).toString();
}

/**
 * Send OTP via email
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  name?: string
): Promise<boolean> {
  try {
    // Configure your email service here
    // Using Gmail as example - you'll need to set up app password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
        pass: process.env.GMAIL_PASSWORD || 'twwgmjwgvadwazxk',
      },
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .content { text-align: center; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; margin: 30px 0; font-family: monospace; }
            .message { color: #666; line-height: 1.6; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
            .warning { color: #dc2626; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Adz4Needz</div>
              <p style="color: #666; margin-top: 10px;">AI Learning Platform</p>
            </div>
            <div class="content">
              <h2>OTP Verification</h2>
              <p class="message">Hello ${name || 'User'},</p>
              <p class="message">Your One-Time Password (OTP) for account verification is:</p>
              <div class="otp-code">${otp}</div>
              <p class="message" style="color: #999; font-size: 14px;">This code will expire in 10 minutes.</p>
              <p class="warning">⚠️ Never share this code with anyone</p>
            </div>
            <div class="footer">
              <p>If you didn't request this code, please ignore this email.</p>
              <p>&copy; 2026 Adz4Needz. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
      to: email,
      subject: 'Your OTP for Adz4Needz Account Verification',
      html: htmlTemplate,
    });

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Store OTP for a user
 */
export function storeOTP(identifier: string, otp: string): void {
  otpStore[identifier] = {
    code: otp,
    timestamp: Date.now(),
    attempts: 0,
    verified: false,
  };
}

/**
 * Verify OTP
 */
export function verifyOTP(identifier: string, inputOTP: string): {
  success: boolean;
  message: string;
} {
  const otpData = otpStore[identifier];

  if (!otpData) {
    return { success: false, message: 'No OTP found for this account. Request a new OTP.' };
  }

  // Check if OTP has expired
  if (Date.now() - otpData.timestamp > OTP_EXPIRY_TIME) {
    delete otpStore[identifier];
    return { success: false, message: 'OTP has expired. Request a new OTP.' };
  }

  // Check attempts
  if (otpData.attempts >= 5) {
    delete otpStore[identifier];
    return { success: false, message: 'Too many failed attempts. Request a new OTP.' };
  }

  // Verify OTP
  if (otpData.code !== inputOTP) {
    otpData.attempts++;
    return { 
      success: false, 
      message: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.` 
    };
  }

  otpData.verified = true;
  return { success: true, message: 'OTP verified successfully!' };
}

/**
 * Check if OTP is verified
 */
export function isOTPVerified(identifier: string): boolean {
  const otpData = otpStore[identifier];
  return otpData ? otpData.verified : false;
}

/**
 * Clear OTP for a user
 */
export function clearOTP(identifier: string): void {
  delete otpStore[identifier];
}

/**
 * Clear all expired OTPs
 */
export function clearExpiredOTPs(): void {
  const now = Date.now();
  Object.keys(otpStore).forEach((key) => {
    if (now - otpStore[key].timestamp > OTP_EXPIRY_TIME) {
      delete otpStore[key];
    }
  });
}
