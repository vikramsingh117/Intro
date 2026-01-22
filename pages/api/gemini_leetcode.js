import { getGeminiLeetCodeResponse } from "./backend/agent/gemini_leetcode";
import { basicRateLimit } from "./backend/middleware";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST method allowed" });

  // Apply rate limiting
  await new Promise((resolve, reject) => {
    basicRateLimit(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Check if rate limit was exceeded (status already set by middleware)
  // Rate limit info is already attached to req.rateLimitInfo by the middleware
  if (res.statusCode === 429) {
    // Response already sent by middleware with rateLimit info
    return;
  }

  const authorization = req.headers.authorization;
  const token = authorization && authorization.split(" ")[1];
  // console.log("Authorization Token:", token);
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const reply = await getGeminiLeetCodeResponse(prompt);
  res.json({ 
    success: true, 
    reply,
    rateLimit: req.rateLimitInfo || null
  });
}
