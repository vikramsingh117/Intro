import { MongoClient } from 'mongodb';
import { createHash } from 'crypto';

// Reuse the connection pool across requests and development hot reloads.
export async function wallNotesCollection() {
  if (!process.env.MONGODB_URI) throw new Error('Database is not configured');
  const key = createHash('sha256').update(process.env.MONGODB_URI).digest('hex');
  if (!globalThis.portfolioMongoPool || globalThis.portfolioMongoPool.key !== key) {
    const previous = globalThis.portfolioMongoPool;
    if (previous) previous.promise.then(client => client.close()).catch(() => {});
    const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    const pool = { key, promise: null };
    pool.promise = client.connect().catch(async () => {
      if (globalThis.portfolioMongoPool === pool) globalThis.portfolioMongoPool = null;
      await client.close().catch(() => {});
      throw new Error('Database connection unavailable');
    });
    globalThis.portfolioMongoPool = pool;
  }
  const client = await globalThis.portfolioMongoPool.promise;
  return client.db(process.env.MONGODB_DB || 'Portfolio').collection('wall_notes');
}
