// Vercel serverless entry - saari /api/* requests yahin aati hain
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect failed:', err.message);
    return res.status(500).json({ message: 'Database connection failed.' });
  }
  return app(req, res);
}