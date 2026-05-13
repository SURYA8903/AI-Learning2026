import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const publicPath = path.join(process.cwd(), 'public');

  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // For development and iframe compatibility
  }));
  app.use(express.json());

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
  });

  // OTP Storage (in-memory for development)
  const otpStore: {
    [key: string]: {
      code: string;
      timestamp: number;
      attempts: number;
      verified: boolean;
    };
  } = {};

  // Nodemailer configuration for OTP sending
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
      pass: process.env.GMAIL_PASSWORD || 'twwgmjwgvadwazxk', // Will use environment variable
    },
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Course Recommendations
  app.post('/api/ai/recommendations', async (req, res) => {
    try {
      const { userProfile, availableCourses } = req.body;
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const prompt = `
        As an expert career counselor, recommend exactly 3 courses from the list below for a student with the following profile:
        Student Skills: ${userProfile.skills?.join(', ') || 'None listed'}
        Student Bio: ${userProfile.bio || 'Not provided'}

        Available Courses:
        ${JSON.stringify(availableCourses.map((c: any) => ({ id: c.id, title: c.title, description: c.description, category: c.category })))}

        Return only a JSON array of the 3 course IDs. No explanation.
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });
      
      const text = response.text;
      
      // Extract IDs from response (handling potential markdown)
      const cleanedText = text ? text.replace(/```json|```/g, '').trim() : '[]';
      const ids = JSON.parse(cleanedText);
      res.json(ids);
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      res.status(500).json({ error: 'AI failed to generate recommendations' });
    }
  });

  // Razorpay Order Creation
  app.post('/api/payments/order', async (req, res) => {
    try {
      const { amount, currency = 'INR', receipt } = req.body;
      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit
        currency,
        receipt,
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error('Razorpay Order Error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Razorpay Payment Verification
  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        res.json({ status: 'success', message: 'Payment verified' });
      } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature' });
      }
    } catch (error) {
      console.error('Verification Error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // ==================== OTP ENDPOINTS ====================

  /**
   * Generate and send OTP
   */
  app.post('/api/otp/send', async (req, res) => {
    try {
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP
      otpStore[email] = {
        code: otp,
        timestamp: Date.now(),
        attempts: 0,
        verified: false,
      };

      // Send OTP via email
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              .subtitle { color: #666; margin-top: 5px; font-size: 14px; }
              .content { text-align: center; }
              .content h2 { color: #333; margin-top: 0; }
              .otp-code { font-size: 48px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; margin: 30px 0; font-family: 'Courier New', monospace; background: #f0f4ff; padding: 20px; border-radius: 8px; }
              .message { color: #666; line-height: 1.6; font-size: 15px; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
              .warning { color: #dc2626; font-weight: bold; margin-top: 20px; font-size: 14px; }
              .expiry { color: #ff9800; margin-top: 15px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">SkillsUp</div>
                <div class="subtitle">AI Learning Platform</div>
              </div>
              <div class="content">
                <h2>🔐 OTP Verification</h2>
                <p class="message">Hello ${name || 'User'},</p>
                <p class="message">Your One-Time Password (OTP) for account verification is:</p>
                <div class="otp-code">${otp}</div>
                <p class="expiry">⏱️ This code will expire in 10 minutes</p>
                <p class="warning">⚠️ Never share this code with anyone</p>
                <p class="message" style="margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2026 SkillsUp. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
        to: email,
        subject: '🔐 Your OTP for SkillsUp Account Verification',
        html: htmlTemplate,
      });

      console.log(`✅ OTP sent to ${email}: ${otp}`);
      res.json({ 
        success: true, 
        message: 'OTP sent successfully',
        expiresIn: 600000 // 10 minutes in milliseconds
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP. Check email configuration.' });
    }
  });

  /**
   * Verify OTP
   */
  app.post('/api/otp/verify', async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
      }

      const otpData = otpStore[email];

      if (!otpData) {
        return res.status(400).json({ error: 'No OTP found. Request a new OTP.' });
      }

      // Check if OTP has expired (10 minutes)
      if (Date.now() - otpData.timestamp > 10 * 60 * 1000) {
        delete otpStore[email];
        return res.status(400).json({ error: 'OTP has expired. Request a new OTP.' });
      }

      // Check attempts
      if (otpData.attempts >= 5) {
        delete otpStore[email];
        return res.status(400).json({ error: 'Too many failed attempts. Request a new OTP.' });
      }

      // Verify OTP
      if (otpData.code !== otp) {
        otpData.attempts++;
        return res.status(400).json({ 
          error: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.` 
        });
      }

      // Mark as verified
      otpData.verified = true;
      res.json({ 
        success: true, 
        message: 'OTP verified successfully!',
        verified: true
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  /**
   * Check if OTP is verified
   */
  app.post('/api/otp/check', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const otpData = otpStore[email];
      const verified = otpData ? otpData.verified : false;

      res.json({ verified });
    } catch (error) {
      console.error('Error checking OTP:', error);
      res.status(500).json({ error: 'Check failed' });
    }
  });

  app.use(express.static(publicPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }

    res.sendFile(path.join(publicPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT} (serving public/)`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
