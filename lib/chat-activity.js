import { portfolioCollection } from './mongodb';
import { databaseTime } from './database-time.mjs';

// Fail independently of generation, and never log visitor text or credentials.
export async function startChatActivity(prompt) {
  try {
    const collection = await portfolioCollection('chatbot_requests');
    const result = await collection.insertOne({
      prompt, status: 'generating', ...databaseTime('createdAt'),
    }, { maxTimeMS: 3000 });
    return { collection, id: result.insertedId };
  } catch {
    console.warn('Chat activity storage unavailable.');
    return null;
  }
}

export async function finishChatActivity(activity, { response, mode, status }) {
  if (!activity) return;
  try {
    await activity.collection.updateOne({ _id: activity.id }, {
      $set: { response, mode, status, ...databaseTime('finishedAt') },
    }, { maxTimeMS: 3000 });
  } catch {
    console.warn('Chat activity update unavailable.');
  }
}
