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
  const [showToken, setShowToken] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [jwtGenerated, setJwtGenerated] = useState(false);
  const [jwtLoading, setJwtLoading] = useState(false);
  const [jwtError, setJwtError] = useState("");
  const [AIToggle, setAIToggle] = useState(true);

  useEffect(() => {
    const saveIp = async () => {
      await fetch("/api/save-ip");
    };
    saveIp();
  }, []);

  // Automatically hide the JWT message after 3 seconds
  useEffect(() => {
    if (jwtGenerated && showToken) {
      const timer = setTimeout(() => {
        setShowToken(false);
        setJwtGenerated(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [jwtGenerated, showToken]);

  const handleShowToken = async () => {
    // Generate JWT token first
    setJwtLoading(true);
    setJwtError("");

    const result = await generateJWT();

    if (result.success) {
      setJwtGenerated(true);
      setShowToken(true);
    } else {
      setJwtError(result.error || "Failed to generate JWT");
    }

    setJwtLoading(false);
  };

  const handleShowUserInfo = async () => {
    setShowUserInfo((v) => !v);
    await fetchUserInfo();
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
                <h3>Figma Clone</h3>
                <p> Next.js, Codeblocks</p>
                <p className={styles.projectDescription}>
                  Implemented live collaboration features and improved SEO.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.bwappCard}`}>
                <h3>bWAPP Attack</h3>
                <p> SQL Injection, Phishing, Crawlers</p>
                <p className={styles.projectDescription}>
                  Accessed unprotected CCTV cameras and exploited
                  vulnerabilities.
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

            {/* Show Token Button - Only show if authenticated */}
            {isAuthenticated && (
              <div className={styles.actionButtonsWrapper}>
                <button
                  onClick={handleShowToken}
                  disabled={jwtLoading}
                  className={`${styles.actionButton} ${
                    jwtLoading ? styles.actionButtonDisabled : ""
                  }`}
                >
                  {jwtLoading ? "Generating JWT..." : "Generate JWT"}
                </button>

                <button
                  onClick={handleShowUserInfo}
                  className={styles.actionButton}
                >
                  {showUserInfo ? "Hide Info" : "Show Info"}
                </button>

                {jwtError && (
                  <div className={`${styles.boxed} ${styles.errorBox}`}>
                    Error: {jwtError}
                  </div>
                )}

                {showToken && jwtGenerated && (
                  <div
                    className={`${styles.boxed} ${
                      showToken ? styles.tokenVisible : styles.tokenHidden
                    }`}
                  >
                    <p className={styles.tokenHeading}>
                      Your JWT Token (User ID: {user?.userId}):
                    </p>
                    <code className={styles.monocode}>{getToken()}</code>
                  </div>
                )}

                {showUserInfo && userInfo && (
                  <div
                    className={`${styles.boxed} ${
                      showUserInfo ? styles.tokenVisible : styles.tokenHidden
                    }`}
                  >
                    <p className={styles.tokenHeading}>
                      Your System & Location Information:
                    </p>
                    <div className={styles.infoContent}>
                      <strong>IP Address:</strong> {userInfo.ip}
                      <br />
                      <strong>Coordinates:</strong>{" "}
                      {userInfo.latitude && userInfo.longitude
                        ? `${userInfo.latitude}, ${userInfo.longitude}`
                        : "Unknown"}
                      <br />
                      <strong>OS & Device:</strong> {userInfo.os}
                      <br />
                      <strong>Browser:</strong> {userInfo.browser}
                      <br />
                      <strong>State:</strong> {userInfo.state}
                      <br />
                      <strong>Postal Code:</strong> {userInfo.postalCode}
                      <br />
                      <strong>Temperature:</strong> {userInfo.temperature}
                      <br />
                      <strong>Edge Server:</strong> {userInfo.edgeServer}
                      <br />
                      {userInfo.rateLimit && (
                        <>
                          <strong>Rate Limit:</strong>{" "}
                          {userInfo.rateLimit.requestsUsed}/15 requests used
                          <br />
                          <strong>Requests Remaining:</strong>{" "}
                          {userInfo.rateLimit.requestsRemaining}
                          <br />
                          <strong>Reset Time:</strong>{" "}
                          {userInfo.rateLimit.resetTime}
                        </>
                      )}
                    </div>
                  </div>
                )}
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
