import { getGeminiLeetCodeResponse } from "../../backend/agent/gemini_leetcode";

export default async function handler(req, res) {

  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST method allowed" });
    const authorization = req.headers.authorization;
  const token = authorization && authorization.split(" ")[1];
  console.log("Authorization Token:", token);
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const reply = await getGeminiLeetCodeResponse(prompt);
  res.json({ success: true, reply });
}
