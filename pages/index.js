import Head from "next/head";
import Image from "next/image";
import Header from "../components/Header";
import ContactCard from "../components/ContactCard";
import ActivityCard from "../components/ActivityCard";
import ActivityTimeline from "../components/ActivityTimeline";
import styles from "../styles/Home.module.css";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Home() {
  const { getToken, isAuthenticated, user, userInfo } = useAuth();
  const [showToken, setShowToken] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  const handleShowToken = () => {
    setShowToken(!showToken);
  };

  const handleShowUserInfo = () => {
    setShowUserInfo(!showUserInfo);
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
                  Created a Backtesting Bot for NIFTY Stock, generating high returns and signals.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.goCard}`}>
                <h3>Tab Reminder: Google Chrome Extension</h3>
                <p> Javascript, Node.js</p>
                <p className={styles.projectDescription}>
                  Created and deployed a Google Chrome Extension that reopens closed tabs after a certain time.
                </p>
              </div>
            </div>

            {/* Show Token Button - Only show if authenticated */}
            {isAuthenticated && (
              <div style={{ marginTop: '0.1rem', marginBottom: '1rem', textAlign: 'center' }}>
                <button
                  onClick={handleShowToken}
                  style={{
                    margin: '0.5rem',
                    padding: '1.0rem',
                    textAlign: 'center',
                    color: '#834bbe',
                    background: 'transparent',
                    textDecoration: 'none',
                    border: '2px solid #c55f5f',
                    borderRadius: '1rem 1rem 1rem 1rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.5s',
                    backdropFilter: 'blur(0px)',

                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ed5181';
                    e.target.style.border = '2px solid #663c92';
                    e.target.style.fontSize = '1.2rem';
                    e.target.style.backdropFilter = 'blur(10px)';
                    e.target.style.boxShadow = '0 0 10px rgba(255, 0, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#834bbe';
                    e.target.style.border = '2px solid #c55f5f';
                    e.target.style.fontSize = '1.1rem';
                    e.target.style.backdropFilter = 'blur(0px)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {showToken ? 'Hide Token' : 'Show Token'}
                </button>

                <button
                  onClick={handleShowUserInfo}
                  style={{
                    margin: '0.5rem',
                    padding: '1.0rem',
                    textAlign: 'center',
                    color: '#834bbe',
                    background: 'transparent',
                    textDecoration: 'none',
                    border: '2px solid #c55f5f',
                    borderRadius: '1rem 1rem 1rem 1rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.5s',
                    backdropFilter: 'blur(0px)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ed5181';
                    e.target.style.border = '2px solid #663c92';
                    e.target.style.fontSize = '1.2rem';
                    e.target.style.backdropFilter = 'blur(10px)';
                    e.target.style.boxShadow = '0 0 10px rgba(255, 0, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#834bbe';
                    e.target.style.border = '2px solid #c55f5f';
                    e.target.style.fontSize = '1.1rem';
                    e.target.style.backdropFilter = 'blur(0px)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {showUserInfo ? 'Hide Info' : 'Show Info'}
                </button>
                
                {showToken && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '1.0rem',
                    background: 'transparent',
                    border: '2px solid #c55f5f',
                    borderRadius: '1rem 1rem 1rem 1rem',
                    maxWidth: '800px',
                    margin: '1rem auto',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    color: '#834bbe',
                    lineHeight: '1.5',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.5s ease-in-out',
                    animation: 'tokenSlideIn 0.5s ease-out',
                    opacity: showToken ? 1 : 0,
                    transform: showToken ? 'translateY(0)' : 'translateY(-20px)',
                  }}>
                    <p style={{ color: '#834bbe',margin:"0", fontWeight: 'bold' }}>
                      Your JWT Token (User ID: {user?.userId}):
                    </p>
                    <code style={{ color: '#834bbe' }}>
                      {getToken()}
                    </code>
                  </div>
                )}

                {showUserInfo && userInfo && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '1.0rem',
                    background: 'transparent',
                    border: '2px solid #c55f5f',
                    borderRadius: '1rem 1rem 1rem 1rem',
                    maxWidth: '800px',
                    margin: '1rem auto',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    color: '#834bbe',
                    lineHeight: '1.5',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.5s ease-in-out',
                    animation: 'tokenSlideIn 0.5s ease-out',
                    opacity: showUserInfo ? 1 : 0,
                    transform: showUserInfo ? 'translateY(0)' : 'translateY(-20px)',
                  }}>
                    <p style={{ color: '#834bbe', margin: "0 0 0.5rem 0", fontWeight: 'bold' }}>
                      Your System & Location Information:
                    </p>
                    <div style={{ color: '#834bbe', textAlign: 'left' }}>
                      <strong>IP Address:</strong> {userInfo.ip}<br/>
                      <strong>Coordinates:</strong> {userInfo.latitude && userInfo.longitude 
                        ? `${userInfo.latitude}, ${userInfo.longitude}` 
                        : 'Unknown'}<br/>
                      <strong>OS & Device:</strong> {userInfo.os}<br/>
                      <strong>Browser:</strong> {userInfo.browser}<br/>
                      <strong>State:</strong> {userInfo.state}<br/>
                      <strong>Postal Code:</strong> {userInfo.postalCode}<br/>
                      <strong>Temperature:</strong> {userInfo.temperature}<br/>
                      <strong>Edge Server:</strong> {userInfo.edgeServer}<br/>
                      {userInfo.rateLimit && (
                        <>
                          <strong>Rate Limit:</strong> {userInfo.rateLimit.requestsUsed}/30 requests used<br/>
                          <strong>Requests Remaining:</strong> {userInfo.rateLimit.requestsRemaining}<br/>
                          <strong>Reset Time:</strong> {userInfo.rateLimit.resetTime}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Typing Animation */}
            <Header />

            {/* Activity Timeline - Recent coding activities */}
            <ActivityTimeline />

            {/* GitHub and LeetCode Activity Cards */}
            <ActivityCard />
          </main>
        </div>
      </div>
    </>
  );
}
