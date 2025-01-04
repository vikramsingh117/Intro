import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <div
        style={{
          backgroundImage: `url("111.jpg")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundAttachment: "scroll",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        <div className={styles.container}>
          <Head>
            <title>Vikram Singh</title>
            <meta name="description" content="Web by Vikram Singh" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className={styles.main}>

            {/* Scattered Project Cards */}

            <div className={styles.projectCards}>
              <div className={`${styles.projectCard} ${styles.compilerCard}`}>
                <h3>Simplified Compiler</h3>
                <p>Technology: C, LEX, YACC</p>
                <p className={styles.projectDescription}>
                  A compiler that parses and compiles 200 lines of code.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.figmaCard}`}>
                <h3>Figma Clone</h3>
                <p>Technology: Next.js, Codeblocks</p>
                <p className={styles.projectDescription}>
                  Implemented live collaboration features and improved SEO.
                </p>
              </div>

              <div className={`${styles.projectCard} ${styles.bwappCard}`}>
                <h3>bWAPP Attack</h3>
                <p>Techniques: SQL Injection, Phishing</p>
                <p className={styles.projectDescription}>
                  Accessed unprotected CCTV cameras and exploited
                  vulnerabilities.
                </p>
              </div>
            </div>


            <h1 className={styles.title}>Welcome to My Website</h1>

            <div className={styles.grid}>
              <a
                href="https://www.instagram.com/ss.vikram_/"
                className={styles.card}
              >
                <h2>Instagram</h2>
              </a>

              <a
                href="https://www.linkedin.com/in/vikram-singh-9b48a4220"
                className={styles.card}
              >
                <h2>LinkedIn</h2>
              </a>

              <a href="mailto:vikramandanshu@gmail.com" className={styles.card}>
                <h2>Mail</h2>
              </a>
              <a href="http://matias.ma/nsfw/" className={styles.card1}>
                <h2>?</h2>
              </a>

              <a
                href="https://github.com/vikramsingh117"
                className={styles.card1}
              >
                <h2>GitHub</h2>
              </a>
            </div>

            {/* GitHub and LeetCode Activity Cards */}
            <div className={styles.activityContainer}>
              <div className={styles.activityImages}>
                {/* GitHub Stats */}
                <img
                  src="https://github-readme-stats.vercel.app/api?username=vikramsingh117&show_icons=true&theme=radical"
                  alt="GitHub Stats"
                  className={styles.activityImage}
                />
                {/* LeetCode Monthly Activity Graph */}
                <img
                  className={styles.activityImage}
                  src="https://leetcard.jacoblin.cool/vikramandanshu?ext=heatmap&theme=dark"
                  alt="LeetCode Activity Graph"
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
