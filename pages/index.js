import Head from "next/head";
import Image from "next/image";
import Header from "../components/Header";
import ActivityCard from "../components/ActivityCard";
import ActivityTimeline from "../components/ActivityTimeline";
import styles from "../styles/Home.module.css";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import LeetCodeChat from "../components/LeetCodeChat";
import CityVisitsChart from "../components/CityVisitsChart";

export default function Home() {
  const { getToken, isAuthenticated, user, userInfo, generateJWT, fetchUserInfo } = useAuth();
  const [jwtLoading, setJwtLoading] = useState(false);
  const [jwtError, setJwtError] = useState("");
  const [AIToggle, setAIToggle] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Check if token exists on mount
  useEffect(() => {
    const checkToken = () => {
      const token = typeof window !== "undefined" && getToken();
      setHasToken(!!token);
    };
    checkToken();
  }, [getToken]);

  useEffect(() => {
    const saveIp = async () => {
      await fetch("/api/save-ip");
    };
    saveIp();
    // Fetch user info on mount
    fetchUserInfo();
  }, []);

  const handleShowToken = async () => {
    // Generate JWT token first
    setJwtLoading(true);
    setJwtError("");

    const result = await generateJWT();

    if (result.success) {
      // Start fade out animation
      setIsFadingOut(true);
      // Wait for fade animation to complete before hiding button
      setTimeout(() => {
        setHasToken(true);
        setIsFadingOut(false);
      }, 500); // Match CSS transition duration
    } else {
      setJwtError(result.error || "Failed to generate JWT");
    }

    setJwtLoading(false);
  };

  return (
    
    <>


      <div className={styles.backgroundContainer}>
        {/* Optimized background image */}
        <Image
          src="/wallpaper.jpg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          priority
          quality={85}
        />
        <div className={styles.container}>
          <Head>
            <title>Vikram Singh</title>
            <meta name="description" content="Web by Vikram Singh" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className={styles.main}>
            {/* Project Cards */}
            <div className={styles.projectCards}>
              <div className={`${styles.projectCard} ${styles.compilerCard}`}>
                <h3>Simplified Compiler</h3>
                <p> C, LEX, YACC</p>
                <p className={styles.projectDescription}>
                  A compiler that parses and compiles 200 lines of code.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.figmaCard}`}>
                <h3>Web Crawler & Search Indexer</h3>
                <p> Go, MongoDB</p>
                <p className={styles.projectDescription}>
                  Created a web crawler and search indexer that crawls the web and indexes the content.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.bwappCard}`}>
                <h3>LeetCode Extension</h3>
                <p> Javascript, Chrome Extension</p>
                <p className={styles.projectDescription}>
                  Created a Chrome Extension to bring back old TestCase UI of LeetCode.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.sentimentCard}`}>
                <h3>Sentiment Analyzer</h3>
                <p> ML model, OpenAI, React</p>
                <p className={styles.projectDescription}>
                  Application with a Machine Learning model to understand human
                  semantics.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.botCard}`}>
                <h3>NIFTY Stock Algo Trading Bot</h3>
                <p> API, Python</p>
                <p className={styles.projectDescription}>
                  Created a Backtesting Bot for NIFTY Stock, generating high
                  returns and signals.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.goCard}`}>
                <h3>Tab Reminder: Google Chrome Extension</h3>
                <p> Javascript, Node.js</p>
                <p className={styles.projectDescription}>
                  Created and deployed a Google Chrome Extension that reopens
                  closed tabs after a certain time.
                </p>
              </div>
            </div>

            {/* Show Token Button - Only show if authenticated and token doesn't exist */}
            {isAuthenticated && !hasToken && (
              <div className={styles.actionButtonsWrapper}>
                {/* Rate Limit Info - Left */}
                {userInfo && (
                  <div 
                    className={styles.infoElement}
                    title={userInfo.ip ? `Your IP ${userInfo.ip} is registered in Redis instance` : "Your IP is registered in Redis instance"}
                  >
                    <span className={styles.infoLabel}>Rate Limit:</span>
                    <span className={styles.infoValue}>
                      {userInfo.rateLimit ? `${userInfo.rateLimit.requestsUsed}/15` : "Unknown"}
                    </span>
                  </div>
                )}

                <button
                  id="generate-jwt-btn"
                  onClick={handleShowToken}
                  disabled={jwtLoading}
                  className={`${styles.actionButton} ${
                    jwtLoading ? styles.actionButtonDisabled : ""
                  } ${isFadingOut ? styles.buttonFadeOut : ""}`}
                  title="This button saves the JWT token for AI tool callings"
                >
                  {jwtLoading ? "Generating JWT..." : "Generate JWT"}
                </button>

                {/* Reset Time Info - Right */}
                {userInfo && (
                  <div 
                    className={styles.infoElement}
                    title="Time remaining until window resets"
                  >
                    <span className={styles.infoLabel}>Reset Time:</span>
                    <span className={styles.infoValue}>
                      {(() => {
                        const resetTime = userInfo.rateLimit?.resetTime;
                        // Show "60 seconds" only if it's truly the initial state (not after timer expired)
                        if (!resetTime || resetTime === "Unknown") {
                          return "60 seconds";
                        }
                        // If it's "Reset" and we have a countdown that was active, show "Reset"
                        // Otherwise show the actual value
                        return resetTime;
                      })()}
                    </span>
                  </div>
                )}

                {jwtError && (
                  <div className={`${styles.boxed} ${styles.errorBox}`}>
                    Error: {jwtError}
                  </div>
                )}
              </div>
            )}

            {/* Show info elements even when button is hidden */}
            {isAuthenticated && hasToken && userInfo && (
              <div className={styles.actionButtonsWrapper}>
                {/* Rate Limit Info - Left */}
                <div 
                  className={styles.infoElement}
                  title={userInfo.ip ? `Your IP ${userInfo.ip} is registered in Redis instance` : "Your IP is registered in Redis instance"}
                >
                  <span className={styles.infoLabel}>Rate Limit:</span>
                  <span className={styles.infoValue}>
                    {userInfo.rateLimit ? `${userInfo.rateLimit.requestsUsed}/15` : "Unknown"}
                  </span>
                </div>

                {/* Reset Time Info - Right */}
                <div 
                  className={styles.infoElement}
                  title="Time remaining until window resets"
                >
                  <span className={styles.infoLabel}>Reset Time:</span>
                  <span className={styles.infoValue}>
                    {(() => {
                      const resetTime = userInfo.rateLimit?.resetTime;
                      // Show "60 seconds" only if it's truly the initial state (not after timer expired)
                      if (!resetTime || resetTime === "Unknown") {
                        return "60 seconds";
                      }
                      // If it's "Reset" and we have a countdown that was active, show "Reset"
                      // Otherwise show the actual value
                      return resetTime;
                    })()}
                  </span>
                </div>
              </div>
            )}

            <Header />

            <div className={styles.toggleWrapper}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={AIToggle}
                  onChange={() => setAIToggle(!AIToggle)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleText}>AI Agent</span>
              </label>
            </div>

            {AIToggle ? <LeetCodeChat /> : <ActivityTimeline />}

            <div className={styles.chartandleetcode}>
            <ActivityCard />
            <CityVisitsChart />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
