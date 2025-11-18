import { createToken } from '../backend/auth';
import { basicRateLimit } from '../backend/middleware';

export default async function handler(req, res) {
  // Apply rate limiting at the entry point
  await new Promise((resolve, reject) => {
    basicRateLimit(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { magicNumber } = req.body;

  // Validation
  if (!magicNumber || typeof magicNumber !== 'number') {
    return res.status(400).json({ message: 'Magic number is required and must be a number' });
  }

  try {
    // Create JWT token with the magic number as userId
    const token = createToken({ userId: magicNumber });
    
    res.status(200).json({
      message: 'Authentication successful',
      token,
      userId: magicNumber,
    });
  } catch (error) {
    console.error('Magic auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 