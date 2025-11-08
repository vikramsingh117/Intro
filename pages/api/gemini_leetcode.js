import { getGeminiLeetCodeResponse } from "../../backend/gemini_leetcode.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST method allowed" });

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const reply = await getGeminiLeetCodeResponse(prompt);
  res.json({ success: true, reply });
}
