import { getRedisClient, isRedisAvailable } from './redis.js';

// Simple rate limiter middleware
export const createRateLimiter = (windowSeconds = 60, maxRequests = 15) => {
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

      // Get TTL before checking limit (to include in response even if exceeded)
      const ttl = await redis.ttl(key);

      // Check if limit exceeded
      if (currentCount >= maxRequests) {
        // Attach rate limit info even when limit is exceeded
        req.rateLimitInfo = {
          requestsUsed: currentCount,
          requestsRemaining: 0,
          resetTime: ttl > 0 ? `${ttl} seconds` : 'Reset'
        };
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. You can make ${maxRequests} requests per ${windowSeconds} seconds.`,
          rateLimit: req.rateLimitInfo
        });
      }

      // Increment counter
      const newCount = await redis.incr(key);
      
      // Set expiry only on first request (when count becomes 1)
      if (newCount === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Get TTL after incrementing (refresh in case it was just set)
      const updatedTtl = await redis.ttl(key);

      // Attach rate limit info to request for use in handler
      req.rateLimitInfo = {
        requestsUsed: newCount,
        requestsRemaining: Math.max(0, maxRequests - newCount),
        resetTime: updatedTtl > 0 ? `${updatedTtl} seconds` : 'Reset'
      };

      // Continue to next middleware
      next();

    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request on error
      next();
    }
  };
};

// Basic rate limiter (15 requests per minute)
export const basicRateLimit = createRateLimiter(60, 15);2