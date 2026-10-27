import { useEffect, useRef, useState } from "react";
import styles from "../styles/AboutChat.module.css";

const suggestions = ["What are you building at Upliance?", "How is this website built?", "How does this assistant stream replies?"];
const initialMessage = { role: "assistant", text: "Hi! Ask me about Vikram’s work or how this website and assistant are built.", mode: "intro" };

export default function AboutChat({ theme, embedded = false, active = true }) {
  const activeRef = useRef(active);
  activeRef.current = active;
  const [messages, setMessages] = useState([initialMessage]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("");
  const feed = useRef(null);
  const input = useRef(null);
  const request = useRef(null);
  const busy = useRef(false);

  useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight; }, [messages, loading, error]);
  useEffect(() => () => request.current?.abort(), []);

  async function send(text = prompt) {
    const question = text.trim();
    if (!question || busy.current) return;
    busy.current = true;
    setLoading(true);
    setError("");
    setPrompt("");
    const history = messages.filter(message => message.mode !== "intro" && !message.incomplete).slice(-8);
    setMessages(previous => [...previous, { role: "user", text: question }]);
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 25000);
    let reply = "";
    let complete = false;
    let reader;
    try {
      const response = await fetch("/api/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question, history }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "The assistant couldn’t connect. Please try again.");
      }
      if (!response.body) throw new Error("Streaming is unavailable. Please try again.");
      reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (!complete) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const data = frame.split("\n").filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n");
          if (!data) continue;
          const event = JSON.parse(data);
          if (event.type === "error") throw new Error(event.message);
          if (event.type === "done") { complete = true; break; }
          if (event.type === "delta") {
            const first = !reply;
            reply += event.text;
            const message = { role: "assistant", text: reply, mode: event.mode, incomplete: true };
            setMessages(previous => first ? [...previous, message] : [...previous.slice(0, -1), message]);
            setMode(event.mode);
          }
        }
        if (done) break;
      }
      if (!complete || !reply) throw new Error("The reply was interrupted. Please try again.");
      setMessages(previous => previous.map((message, index) => index === previous.length - 1 ? { ...message, incomplete: false } : message));
    } catch (err) {
      setError(err.name === "AbortError" ? "That took too long. Your question is saved below—please try again." : err.message);
      setPrompt(question);
      if (!reply) setMessages(previous => previous.slice(0, -1));
    } finally {
      clearTimeout(timeout);
      await reader?.cancel().catch(() => {});
      controller.abort();
      busy.current = false;
      setLoading(false);
      if (activeRef.current) input.current?.focus({ preventScroll: true });
    }
  }

  return <div className={`${styles.chat} ${theme === "dark" ? styles.dark : ""} ${embedded ? styles.embedded : ""}`}>
    <div className={styles.header}><div className={styles.avatar}>v<span>✳</span></div><div><strong>Ask Vikram’s assistant</strong><small>{mode === "resume" ? "Résumé mode · saved profile answers" : mode === "ai" ? "AI mode · grounded in the résumé" : "Experience, projects & everything between"}</small></div><button aria-label="Start a new conversation" title="New conversation" disabled={loading} onClick={() => { setMessages([initialMessage]); setPrompt(""); setError(""); setMode(""); input.current?.focus(); }}>↺</button></div>
    <div className={styles.feed} ref={feed} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
      {messages.map((message, index) => <div className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={index}><small>{message.role === "user" ? "YOU" : "VS / ASSISTANT"}{message.mode === "resume" ? " · RÉSUMÉ EXCERPT" : ""}</small><p>{message.text}</p></div>)}
      {messages.length === 1 && <div className={styles.suggestions}>{suggestions.map(question => <button disabled={loading} onClick={() => send(question)} key={question}>{question}<span>↗</span></button>)}</div>}
      {loading && <div className={styles.thinking} role="status"><span/> {messages[messages.length - 1]?.role === "assistant" && messages.length > 1 ? "Writing…" : "Thinking…"}</div>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
    <form onSubmit={event => { event.preventDefault(); send(); }} className={styles.composer}>
      <label htmlFor="about-prompt" className={styles.srOnly}>Ask about Vikram</label>
      <textarea id="about-prompt" ref={input} value={prompt} maxLength={1000} rows={1} disabled={loading} placeholder="What would you like to know?" onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} />
      <button type="submit" disabled={loading || !prompt.trim()} aria-label="Send message">↑</button>
    </form>
    <div className={styles.note}><span>{mode === "resume" ? "Saved résumé answers · AI is currently unavailable" : "AI can make mistakes. Details come from my résumé."}</span><span>{prompt.length}/1000</span></div>
    <div className={styles.note}><span>Questions and replies are saved; questions notify Vikram via ntfy. <a href="/privacy" target="_blank" rel="noreferrer">Privacy</a></span></div>
  </div>;
}
