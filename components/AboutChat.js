// Renders the reusable portfolio assistant as a card on Simple and an observability-rich CLI in After Hours.
// It owns bounded history, local slash commands, SSE decoding, cancellation, runtime metadata, and focus restoration.
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/AboutChat.module.css";

const suggestions = ["What are you building at Upliance?", "How is this website built?", "How does this assistant stream replies?"];
const initialMessage = { role: "assistant", text: "Hi! Ask me about Vikram’s work or how this website and assistant are built.", mode: "intro" };
const cliInitialMessage = { role: "system", text: "portfolio-ai ready · grounded résumé and repository context loaded", mode: "intro" };
const defaultRuntime = { model: "gemini-3.1-flash-lite", masterPrompt: "Loading server-owned master prompt…", maxOutputTokens: 700, temperature: 0.4, historyLimit: 8, transport: "SSE" };

const tokenValue = value => Number.isFinite(value) ? value.toLocaleString() : "n/a";
const timeValue = value => Number.isFinite(value) ? `${Math.round(value)} ms` : "n/a";

export default function AboutChat({ theme, embedded = false, active = true }) {
  const activeRef = useRef(active);
  activeRef.current = active;
  const freshMessages = () => [embedded ? cliInitialMessage : initialMessage];
  const [messages, setMessages] = useState(freshMessages);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("");
  const [runtime, setRuntime] = useState(defaultRuntime);
  const [masterOpen, setMasterOpen] = useState(false);
  const feed = useRef(null);
  const input = useRef(null);
  const request = useRef(null);
  const busy = useRef(false);
  const commandHistory = useRef([]);
  const commandIndex = useRef(null);

  const session = useMemo(() => messages.reduce((totals, message) => {
    if (!message.meta) return totals;
    totals.requests += 1;
    if (Number.isFinite(message.meta.inputTokens) || Number.isFinite(message.meta.outputTokens)) totals.reported += 1;
    if (Number.isFinite(message.meta.inputTokens)) totals.input += message.meta.inputTokens;
    if (Number.isFinite(message.meta.outputTokens)) totals.output += message.meta.outputTokens;
    return totals;
  }, { requests: 0, reported: 0, input: 0, output: 0 }), [messages]);
  const sessionInput = session.reported ? tokenValue(session.input) : session.requests ? "n/a" : "0";
  const sessionOutput = session.reported ? tokenValue(session.output) : session.requests ? "n/a" : "0";

  useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight; }, [messages, loading, error, masterOpen]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (!embedded) return;
    let cancelled = false;
    fetch("/api/about", { headers: { Accept: "application/json" } })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("metadata unavailable")))
      .then(data => { if (!cancelled) setRuntime(current => ({ ...current, ...data })); })
      .catch(() => { if (!cancelled) setRuntime(current => ({ ...current, masterPrompt: "Master prompt unavailable in this session." })); });
    return () => { cancelled = true; };
  }, [embedded]);

  const resetConversation = () => {
    request.current?.abort();
    setMessages(freshMessages());
    setPrompt(""); setError(""); setMode(""); setLoading(false);
    busy.current = false; commandIndex.current = null;
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  };

  const runLocalCommand = command => {
    const name = command.toLowerCase().split(/\s+/)[0];
    if (name === "/clear") { resetConversation(); return true; }
    let output;
    if (name === "/help") output = "commands: /help /prompt /model /stats /clear\nEnter sends · Shift+Enter adds a line · ↑/↓ recalls commands · the ^C button stops a request";
    else if (name === "/prompt") { setMasterOpen(true); output = "opened master_prompt.md in read-only mode"; }
    else if (name === "/model") output = `${runtime.model} · temperature ${runtime.temperature} · max output ${runtime.maxOutputTokens} tokens · ${runtime.transport}`;
    else if (name === "/stats") output = `${session.requests} request(s) · ${sessionInput} input tokens · ${sessionOutput} output tokens`;
    else output = `command not found: ${name}\nrun /help for available commands`;
    setMessages(previous => [...previous, { role: "user", text: command, local: true }, { role: "system", text: output, local: true }]);
    setPrompt(""); setError("");
    return true;
  };

  async function send(text = prompt) {
    const question = text.trim();
    if (!question || busy.current) return;
    commandHistory.current = [...commandHistory.current.filter(item => item !== question), question].slice(-30);
    commandIndex.current = null;
    if (embedded && question.startsWith("/") && runLocalCommand(question)) return;
    busy.current = true;
    setLoading(true); setError(""); setPrompt("");
    const history = messages.filter(message => ["user", "assistant"].includes(message.role) && message.mode !== "intro" && !message.incomplete && !message.local).slice(-8);
    setMessages(previous => [...previous, { role: "user", text: question, createdAt: Date.now() }]);
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 25000);
    const clientStarted = performance.now();
    let firstTokenAt = null;
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
          if (event.type === "done") {
            complete = true;
            const completedAt = performance.now();
            const meta = { ...event.meta, roundTripMs: completedAt - clientStarted, firstTokenMs: firstTokenAt === null ? null : firstTokenAt - clientStarted, completedAt: Date.now() };
            setMessages(previous => previous.map((message, index) => index === previous.length - 1 ? { ...message, incomplete: false, meta } : message));
            break;
          }
          if (event.type === "delta") {
            if (firstTokenAt === null) firstTokenAt = performance.now();
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
    } catch (err) {
      setError(err.name === "AbortError" ? "Request stopped or timed out. Your prompt is ready to retry." : err.message);
      setPrompt(question);
      if (!reply && !embedded) setMessages(previous => previous.slice(0, -1));
    } finally {
      clearTimeout(timeout);
      await reader?.cancel().catch(() => {});
      controller.abort();
      if (request.current === controller) request.current = null;
      busy.current = false;
      setLoading(false);
      if (activeRef.current) input.current?.focus({ preventScroll: true });
    }
  }

  const handleInputKey = event => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); return; }
    if (!embedded || !["ArrowUp", "ArrowDown"].includes(event.key) || prompt.includes("\n")) return;
    const items = commandHistory.current;
    if (!items.length) return;
    event.preventDefault();
    if (event.key === "ArrowUp") commandIndex.current = commandIndex.current === null ? items.length - 1 : Math.max(0, commandIndex.current - 1);
    else commandIndex.current = commandIndex.current === null ? null : commandIndex.current >= items.length - 1 ? null : commandIndex.current + 1;
    setPrompt(commandIndex.current === null ? "" : items[commandIndex.current]);
  };

  if (embedded) return <div className={`${styles.chat} ${styles.dark} ${styles.embedded} ${styles.cli}`}>
    <header className={styles.cliHeader}>
      <div><span className={styles.cliMark} aria-hidden="true">›_</span><strong>portfolio-ai</strong><small>grounded assistant CLI</small></div>
      <button type="button" disabled={loading} onClick={resetConversation} aria-label="Clear assistant session">clear</button>
    </header>
    <div className={styles.cliStatus} aria-label="Assistant runtime">
      <span data-active={loading}>{loading ? "● streaming" : "● ready"}</span><span>model {runtime.model}</span><span>{runtime.transport.toLowerCase()}</span><span>ctx {Math.min(messages.filter(item => ["user", "assistant"].includes(item.role) && item.mode !== "intro").length, runtime.historyLimit)}/{runtime.historyLimit}</span><span>session in/out {sessionInput}/{sessionOutput}</span>
    </div>
    <details className={styles.cliMaster} open={masterOpen} onToggle={event => setMasterOpen(event.currentTarget.open)}>
      <summary><span>master_prompt.md</span><em>read-only</em></summary>
      <pre tabIndex={0}>{runtime.masterPrompt}</pre>
    </details>
    <div className={`${styles.feed} ${styles.cliFeed}`} ref={feed} role="log" aria-label="Assistant CLI output" aria-live="polite" aria-relevant="additions text">
      <div className={styles.cliBoot}>portfolio-ai 1.0 · type <b>/help</b> for commands</div>
      {messages.map((message, index) => message.role === "user" ? <div className={styles.cliEntry} key={index}>
        <div className={styles.cliCommand}><span>visitor@portfolio:~$</span> {message.local ? message.text : "ask"} {!message.local && <strong>{message.text}</strong>}</div>
      </div> : message.role === "system" ? <div className={styles.cliSystem} key={index}># {message.text}</div> : <div className={styles.cliEntry} key={index}>
        <div className={styles.cliResponseLabel}>assistant@{message.meta?.model || runtime.model}{message.mode === "resume" ? " [fallback]" : ""}</div>
        <pre className={styles.cliResponse}>{message.text}</pre>
        {message.meta && <div className={styles.cliMetrics}>
          <span title="Provider-reported prompt and context tokens">in <b>{tokenValue(message.meta.inputTokens)}</b></span>
          <span>out <b>{tokenValue(message.meta.outputTokens)}</b></span>
          <span>total <b>{tokenValue(message.meta.totalTokens)}</b></span>
          <span title="Server generation duration">server <b>{timeValue(message.meta.latencyMs)}</b></span>
          <span title="Browser request to first streamed text">ttft <b>{timeValue(message.meta.firstTokenMs)}</b></span>
          <span title="Browser request to completion">round-trip <b>{timeValue(message.meta.roundTripMs)}</b></span>
          <span>finish <b>{message.meta.finishReason || "n/a"}</b></span>
        </div>}
      </div>)}
      {messages.length === 1 && <div className={styles.cliSuggestions}>{suggestions.map(question => <button disabled={loading} onClick={() => send(question)} key={question}><span>$ ask</span> {question}</button>)}</div>}
      {loading && <div className={styles.cliThinking} role="status"><span/> streaming response<span className={styles.cliCursor}>_</span></div>}
      {error && <pre role="alert" className={styles.cliError}>error: {error}</pre>}
    </div>
    <form onSubmit={event => { event.preventDefault(); if (!loading) send(); }} className={styles.cliComposer}>
      <label htmlFor="cli-about-prompt"><span>visitor@portfolio:~$</span><textarea id="cli-about-prompt" ref={input} value={prompt} maxLength={1000} rows={1} disabled={loading} placeholder={'ask "What is Vikram building?" or /help'} onChange={event => { setPrompt(event.target.value); commandIndex.current = null; }} onKeyDown={handleInputKey}/></label>
      <button type={loading ? "button" : "submit"} onClick={loading ? () => request.current?.abort() : undefined} disabled={!loading && !prompt.trim()} aria-label={loading ? "Stop generation" : "Run command"}>{loading ? "^C" : "run"}</button>
    </form>
    <footer className={styles.cliFooter}><span>/help · /prompt · /model · /stats · /clear</span><span>{prompt.length}/1000</span></footer>
  </div>;

  return <div className={`${styles.chat} ${theme === "dark" ? styles.dark : ""}`}>
    <div className={styles.header}><div className={styles.avatar}>v<span>✳</span></div><div><strong>Ask Vikram’s assistant</strong><small>{mode === "resume" ? "Résumé mode · saved profile answers" : mode === "ai" ? "AI mode · grounded in résumé + site context" : "Experience, projects & everything between"}</small></div><button aria-label="Start a new conversation" title="New conversation" disabled={loading} onClick={resetConversation}>↺</button></div>
    <div className={styles.feed} ref={feed} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
      {messages.map((message, index) => <div className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={index}><small>{message.role === "user" ? "YOU" : "VS / ASSISTANT"}{message.mode === "resume" ? " · RÉSUMÉ EXCERPT" : ""}</small><p>{message.text}</p></div>)}
      {messages.length === 1 && <div className={styles.suggestions}>{suggestions.map(question => <button disabled={loading} onClick={() => send(question)} key={question}>{question}<span>↗</span></button>)}</div>}
      {loading && <div className={styles.thinking} role="status"><span/> {messages[messages.length - 1]?.role === "assistant" && messages.length > 1 ? "Writing…" : "Thinking…"}</div>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
    <form onSubmit={event => { event.preventDefault(); send(); }} className={styles.composer}>
      <label htmlFor="about-prompt" className={styles.srOnly}>Ask about Vikram</label>
      <textarea id="about-prompt" ref={input} value={prompt} maxLength={1000} rows={1} disabled={loading} placeholder="What would you like to know?" onChange={event => setPrompt(event.target.value)} onKeyDown={handleInputKey}/>
      <button type="submit" disabled={loading || !prompt.trim()} aria-label="Send message">↑</button>
    </form>
    <div className={styles.note}><span>{mode === "resume" ? "Saved résumé answers · AI is currently unavailable" : "AI can make mistakes. Details come from my résumé."}</span><span>{prompt.length}/1000</span></div>
  </div>;
}
