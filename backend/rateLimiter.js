import { getRedisClient, isRedisAvailable } from './redis.js';

// Simple rate limiter middleware
export const createRateLimiter = (windowSeconds = 60, maxRequests = 30) => {
  return async (req, res, next) => {
    try {
      // Check if Redis is available, if not, allow request
      const redisAvailable = await isRedisAvailable();
      if (!redisAvailable) {
        console.warn('Redis unavailable, allowing request');
        return next();
      }

      // Use IP as key (simple approach)
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `rate_limit:${ip}`;

      // Get Redis client and check current count
      const redis = await getRedisClient();
      let currentCount = await redis.get(key);
      currentCount = currentCount ? parseInt(currentCount, 10) : 0;

      // Check if limit exceeded
      if (currentCount >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. You can make ${maxRequests} requests per ${windowSeconds} seconds.`
        });
      }

      // Increment counter
      const newCount = await redis.incr(key);
      
      // Set expiry only on first request (when count becomes 1)
      if (newCount === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Continue to next middleware
      next();

    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request on error
      next();
    }
  };
};

// Basic rate limiter (30 requests per minute)
export const basicRateLimit = createRateLimiter(60, 30); 