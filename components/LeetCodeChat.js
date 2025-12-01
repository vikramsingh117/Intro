import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/LeetCodeChat.module.css";

const LeetCodeChat = () => {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dynamicStyle = {
    height: !reply
      ? "170px" // default before any response
      : reply.length < 150
      ? "100px" // shorter for brief answers
      : "auto", // expand for long replies
    minHeight: "100px",
    maxHeight: "400px",
  };
  const { getToken } = useAuth();
const token = typeof window !== "undefined" ? getToken() : null;
  // console.log("User Token in LeetCodeChat:", token);


  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    if (!token) {
      setError("You are not authenticated: Please Click on Generate JWT");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/gemini_leetcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setReply(data.reply);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch");
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  const clearResponse = () => {
    setReply("");
    setError(null);
    setPrompt("");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  // 🧠 Sample suggestions
  const sampleQueries = [
    "What is Vikram's contest rating?",
    "When did Vikram last participate in a Leetcode contest?",
    "Who is Vikram Singh?",
    "How many easy vs hard problems have Vikram solved?",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Vikram’s Insights</h2>
      </div>

      <div className={styles.activityFeed} style={dynamicStyle}>
        {loading && <p className={styles.loading}>Analyzing your queries...</p>}

        {!loading && !error && reply && (
          <div className={styles.activityItem}>
            <span className={styles.activityMessage}>{reply}</span>
          </div>
        )}

        {!loading && !reply && !error && (
          <div className={styles.suggestions}>
            <p className={styles.suggestionTitle}>Try asking:</p>
            <ul className={styles.suggestionList}>
              {sampleQueries.map((q, i) => (
                <li
                  key={i}
                  onClick={() => setPrompt(q)}
                  className={styles.suggestionItem}
                >
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={sendPrompt} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className={styles.loadMoreContainer}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Vikram's LeetCode progress..."
          className={styles.input}
        />
        <div className={styles.buttonGroup}>
          <button
            onClick={clearResponse}
            disabled={loading}
            className={styles.loadMoreButton}
          >
            Clear
          </button>
          <button
            onClick={sendPrompt}
            disabled={loading}
            className={styles.loadMoreButton}
          >
            {loading ? "Sending..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeChat;
