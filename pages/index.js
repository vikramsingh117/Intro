import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>my first app</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to My website{" "}
          <a href="https://github.com/discordmod217">:D</a>
        </h1>

        <p className={styles.description}>Completely original !!</p>
        <div>(right now, ive just linked weird stuff)</div>
        <div className={styles.grid}>

          <Link href="/about">
            <div className={styles.card2}>
              <h2>BLOGS &rarr;</h2>
            </div>
          </Link>

          <a href="https://github.com/discordmod217" className={styles.card}>
            <h2>about me &rarr;</h2>
          </a>

          <a href="http://matias.ma/nsfw/" className={styles.card}>
            <h2>random stuff &rarr;</h2>
          </a>

          <a href="https://bhailang.js.org/" className={styles.card}>
            <h2>extremely cursed &rarr;</h2>
          </a>

        </div>
      </main>

      <footer className={styles.footer}>
        Powered by me, just me.
      </footer>
    </div>
  );
}
