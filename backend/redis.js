import { createClient } from 'redis';

// Redis client instance
let redisClient = null;

// Create Redis client
const createRedisClient = () => {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    },
    username: process.env.REDIS_USER || 'default',
    password: process.env.REDIS_PASSWORD,
    retry_strategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  // Error handling
  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  client.on('connect', () => {
    console.log('Redis Client Connected');
  });

  client.on('ready', () => {
    console.log('Redis Client Ready');
  });

  client.on('end', () => {
    console.log('Redis Client Disconnected');
  });

  return client;
};

// Get Redis client (singleton pattern)
export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createRedisClient();
    await redisClient.connect();
  }
  return redisClient;
};

// Close Redis connection
export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
};

// Check if Redis is available
export const isRedisAvailable = async () => {
  try {
    const client = await getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis not available:', error.message);
    return false;
  }
}; 