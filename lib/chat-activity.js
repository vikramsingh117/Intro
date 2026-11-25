// Records assistant prompts, responses, modes, and completion states for the private admin observability view.
// Storage failures remain isolated from generation so the user can still receive a streamed or résumé fallback answer.
import { portfolioCollection } from './mongodb';
import { databaseTime } from './database-time.mjs';

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

export async function finishChatActivity(activity, { response, mode, status, model, inputTokens, outputTokens, totalTokens, latencyMs, finishReason }) {
  if (!activity) return;
  try {
    await activity.collection.updateOne({ _id: activity.id }, {
      $set: { response, mode, status, model, inputTokens, outputTokens, totalTokens, durationMs:latencyMs, finishReason, ...databaseTime('finishedAt') },
    }, { maxTimeMS: 3000 });
  } catch {
    console.warn('Chat activity update unavailable.');
  }
}
