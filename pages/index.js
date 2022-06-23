import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Hello</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to My website
          :D
        </h1>

        <p className={styles.description}>Completely original !!</p>
        <div className={styles.grid}>


          <a href="https://www.instagram.com/vikram.real0/" className={styles.card}>
            <h2>Instagram</h2>
          </a>

          <a href="https://www.linkedin.com/in/vikram-singh-9b48a4220" className={styles.card}>
            <h2>Linkedin</h2>
          </a>

          <a href="http://matias.ma/nsfw/" className={styles.card}>
            <h2>?</h2>
          </a>

          <a href="https://github.com/discordmod217" className={styles.card2}>
            <h2>Github</h2>
          </a>

        </div>
      </main>

      <footer className={styles.footer}>
        Powered by me, just me.
      </footer>
    </div>
  );
}
