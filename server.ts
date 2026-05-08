import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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

  // Razorpay Initialization
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
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
