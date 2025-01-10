import Head from "next/head";
import Header from "../components/Header";
import ContactCard from "../components/ContactCard";
import ActivityCard from "../components/ActivityCard";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <div
        style={{
          backgroundImage: `url("wallpaper.jpg")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundAttachment: "scroll",
          backgroundPosition: "center",
          minHeight: "105vh",
        }}
      >
        <div className={styles.container}>
          <Head>
            <title>Vikram Singh</title>
            <meta name="description" content="Web by Vikram Singh" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className={styles.main}>
            {/* Project Cards */}
            <div className={styles.projectCards}>
              {/* Compiler Card */}
              <div className={`${styles.projectCard} ${styles.compilerCard}`}>
                <h3>Simplified Compiler</h3>
                <p> C, LEX, YACC</p>
                <p className={styles.projectDescription}>
                  A compiler that parses and compiles 200 lines of code.
                </p>
              </div>

              {/* Figma Clone Card */}
              <div className={`${styles.projectCard} ${styles.figmaCard}`}>
                <h3>Figma Clone</h3>
                <p> Next.js, Codeblocks</p>
                <p className={styles.projectDescription}>
                  Implemented live collaboration features and improved SEO.
                </p>
              </div>

              {/* bWAPP Attack Card */}
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
                  A compiler that parses and compiles 200 lines of code.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.botCard}`}>
                <h3>Discord Bot and Telegram Bot</h3>
                <p> API, Python</p>
                <p className={styles.projectDescription}>
                  A compiler that parses and compiles 200 lines of code.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.goCard}`}>
                <h3>WAV to FLAC Stream</h3>
                <p> Golang, Data Streaming</p>
                <p className={styles.projectDescription}>
                  A compiler that parses and compiles 200 lines of code.
                </p>
              </div>
            </div>

            {/* Typing Animation */}
            <Header />

            {/* Contact Cards */}
            <div className={styles.grid}>
              <ContactCard
                href="https://www.instagram.com/ss.vikram_/"
                title="Instagram"
              />
              <ContactCard
                href="https://www.linkedin.com/in/vikram-singh-9b48a4220"
                title="LinkedIn"
              />
              <ContactCard
                href="mailto:vikramandanshu@gmail.com"
                title="Mail"
              />
              <ContactCard
                href="http://matias.ma/nsfw/"
                title="?"
                isCard1={true}
              />

              <ContactCard
                href="https://github.com/vikramsingh117"
                title="GitHub"
                isCard1={true}
              />
            </div>

            {/* GitHub and LeetCode Activity */}
            <ActivityCard />
          </main>
        </div>
      </div>
    </>
  );
}
