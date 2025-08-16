// pages/api/auth/verify.js
import { verifyToken } from '../../../backend/auth';
import { basicRateLimit } from '../../../backend/middleware';

export default async function handler(req, res) {
  // Apply rate limiting (called on every page refresh)
  await new Promise((resolve, reject) => {
    basicRateLimit(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(200).json({
      message: 'Token valid',
      userId: payload.userId,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}