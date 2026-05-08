import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function test() {
  console.log("Testing Gemini AI...");
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Say "Gemini is working!"',
    });
    console.log("Response:", response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
