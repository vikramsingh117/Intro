import { useEffect, useState } from "react";
import styles from "../styles/AssistantJourney.module.css";

const steps = [
  { title: "Ask a question", label: "BROWSER → API", detail: "Your question and up to eight previous messages travel to the server.", sample: "What does Vikram build at Upliance?", icon: "↗" },
  { title: "Check the request", label: "VALIDATE + LIMIT", detail: "The API checks the input, limits questions to 1,000 characters, and applies a process-local request limit.", sample: "Valid input · within request limit", icon: "✓" },
  { title: "Master prompt", label: "SET TOPIC BOUNDARIES", detail: "A server-side system instruction tells the assistant to answer only about Vikram and this website, decline unrelated requests, and avoid invented facts. This is model guidance, not a guaranteed filter.", sample: "Off-topic question → redirect to Vikram’s work or this portfolio.", icon: "◇" },
  { title: "Add the knowledge", label: "RÉSUMÉ + REPOSITORY CONTEXT", detail: "The server adds the résumé and a curated explanation of the repo: React components, styling, API, streaming, and limitations. This is embedded text, not vector-search retrieval.", sample: "lib/profile.js + lib/assistant-context.js", icon: "≡" },
  { title: "Generate a response", label: "SERVER → GEMINI", detail: "Gemini receives the context and conversation. The API key stays on the server, with a timeout and cancellation on disconnect.", sample: "Context + question → generated answer", icon: "✳" },
  { title: "Stream it back", label: "SSE → BROWSER", detail: "The server sends text deltas as Gemini produces them. The browser reads the POST response stream and updates the reply incrementally.", sample: "Vikram builds real-time AI experiences at Upliance.", icon: "↓" },
];

export default function AssistantJourney({ theme }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (step === steps.length - 1) setPlaying(false);
      else setStep(step + 1);
    }, 2400);
    return () => clearTimeout(timer);
  }, [playing, step]);

  const current = steps[step];
  return <div className={`${styles.journey} ${theme === "dark" ? styles.dark : ""}`}>
    <div className={styles.top}><span>REQUEST LIFECYCLE</span><button onClick={() => {
      if (playing) setPlaying(false);
      else { setStep(0); setPlaying(true); }
    }}>{playing ? "Pause Ⅱ" : "Replay journey ↻"}</button></div>
    <div className={styles.steps} role="group" aria-label="Assistant request stages">
      {steps.map((item, index) => <button key={item.title} aria-pressed={step === index} className={index < step ? styles.completed : ""} onClick={() => { setPlaying(false); setStep(index); }}>
        <span>{index < step ? "✓" : "0" + (index + 1)}</span><strong>{item.title}</strong>
      </button>)}
    </div>
    <div className={styles.detail} key={step} aria-live={playing ? "off" : "polite"}>
      <div className={styles.detailTop}><span className={styles.icon} aria-hidden="true">{current.icon}</span><span>{current.label}</span><small>{step + 1} / {steps.length}</small></div>
      <p>{current.detail}</p>
      <div className={styles.sample}>
        <small>ILLUSTRATIVE {step === steps.length - 1 ? "STREAM" : "PAYLOAD"}</small>
        {step === steps.length - 1 ? <div className={styles.chunks}>{["Vikram builds ", "real-time AI experiences ", "at Upliance."].map((chunk, index) => <span style={{ animationDelay: index * 450 + "ms" }} key={chunk}>{chunk}</span>)}<span className={styles.done}>done ✓</span></div> : <code>{current.sample}</code>}
      </div>
    </div>
    <div className={styles.source}><span aria-hidden="true">▤</span><div><strong>Knowledge source</strong><p>GCP bucket → embedded résumé</p><small>Source architecture: the current API uses the embedded profile. Live bucket retrieval is not connected.</small></div></div>
    <div className={styles.safeguards}><span>Master prompt</span><span>Server-only key</span><span>Input validation</span><span>Rate limit*</span><span>Timeout & cancellation</span><span>Résumé fallback</span></div>
    <p className={styles.footnote}>Illustrative replay, not live telemetry. *Rate limits are per server process, not a shared deployment-wide quota. If AI is unavailable, labelled résumé excerpts are returned; interrupted replies are reported.</p>
  </div>;
}
