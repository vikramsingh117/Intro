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
            <h1 className={styles.title}>Welcome to My website</h1>

            <p className={styles.description}></p>
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
                <h2>Linkedin</h2>
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
                <h2>Github</h2>
              </a>
            </div>

            {/* GitHub and LeetCode Activity Cards */}
            <div style={{ marginTop: "50px", textAlign: "center" }}>
              <h2 style={{ fontSize: "2rem" }}>My Activities</h2>
              <div>
                {/* GitHub Stats */}
                <img
                  src="https://github-readme-stats.vercel.app/api?username=vikramsingh117&show_icons=true&theme=radical"
                  alt="GitHub Stats"
                  style={{
                    width: "500px",
                    margin: "20px",
                    borderRadius: "10px",
                  }}
                />
                {/* LeetCode Monthly Activity Graph */}
                <img
                  src="https://leetcard.jacoblin.cool/vikramandanshu?ext=heatmap&theme=dark"
                  alt="LeetCode Activity Graph"
                  style={{
                    width: "500px",
                    margin: "20px",
                    borderRadius: "10px",
                  }}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
