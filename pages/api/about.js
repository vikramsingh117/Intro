import { GoogleGenerativeAI } from "@google/generative-ai";
import { profile, resumeAnswer } from "../../lib/profile";
import { masterPrompt, repositoryContext } from "../../lib/assistant-context";

// Bounded, process-local protection. Production can layer a shared gateway limit.
const requests = new Map();
function limited(req) {
  const now = Date.now();
  for (const [key, item] of requests) if (item.reset <= now) requests.delete(key);
  // Only trust the forwarded identity on the deployment platform that sets it.
  const forwarded = process.env.VERCEL === "1" ? req.headers["x-vercel-forwarded-for"] : null;
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress || "unknown";
  const item = requests.get(ip) || { count: 0, reset: now + 60000 };
  if (requests.size >= 10000 && !requests.has(ip)) return true;
  item.count += 1;
  requests.set(ip, item);
  return item.count > 15;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Use POST to ask a question." }); }
  const { prompt, history = [] } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 1000) return res.status(400).json({ error: "Please ask a question of 1–1,000 characters." });
  if (!Array.isArray(history) || history.length > 8 || history.some(item => !item || !["user", "assistant"].includes(item.role) || typeof item.text !== "string" || item.text.length > 6000)) return res.status(400).json({ error: "Please start a new conversation." });
  if (limited(req)) { res.setHeader("Retry-After", "60"); return res.status(429).json({ error: "A few too many questions at once. Please try again in a minute." }); }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  const controller = new AbortController();
  const disconnect = () => controller.abort();
  res.on("close", disconnect);
  const emit = data => {
    if (!res.destroyed && !res.writableEnded) {
      res.write("data: " + JSON.stringify(data) + "\n\n");
      res.flush?.();
    }
  };
  const fallback = () => {
    emit({ type: "delta", text: resumeAnswer(prompt), mode: "resume" });
    emit({ type: "done" });
  };
  const timer = setTimeout(() => controller.abort(), 20000);
  let receivedText = false;
  try {
    if (!process.env.GEMINI_KEY) { fallback(); return; }
    const client = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      systemInstruction: masterPrompt + "\n\nRésumé:\n" + profile + "\n\nRepository context:\n" + repositoryContext,
      generationConfig: { maxOutputTokens: 700, temperature: 0.4 },
    }, { timeout: 18000 });
    const contents = history.map(item => ({ role: item.role === "assistant" ? "model" : "user", parts: [{ text: item.text }] }));
    // Gemini conversations must begin with a user turn.
    while (contents.length && contents[0].role !== "user") contents.shift();
    contents.push({ role: "user", parts: [{ text: prompt }] });
    const result = await model.generateContentStream({ contents }, { signal: controller.signal });
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        receivedText = true;
        emit({ type: "delta", text, mode: "ai" });
      }
    }
    if (!receivedText) throw new Error("empty response");
    emit({ type: "done" });
  } catch {
    if (!res.destroyed) {
      if (receivedText) emit({ type: "error", message: "The reply was interrupted. Please try again." });
      else fallback();
    }
  } finally {
    clearTimeout(timer);
    controller.abort();
    res.off("close", disconnect);
    if (!res.destroyed) res.end();
  }
}
