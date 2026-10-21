import Head from "next/head";
import Link from "next/link";
import styles from "../styles/ThemeChooser.module.css";

export default function ThemeChooser() {
  return <>
    <Head>
      <title>Vikram Singh — Choose your experience</title>
      <meta name="description" content="Explore Vikram Singh’s portfolio: Simple, an editorial overview, or After Hours, an animated engineering story." />
      <meta name="theme-color" content="#f4f1e8" />
    </Head>
    <main className={styles.page}>
      <h1 className={styles.srOnly}>Choose your portfolio experience</h1>
      <div className={styles.options}>
        <div className={styles.pane} data-cursor-theme="simple">
        <Link href="/simple"><a className={styles.card} aria-label="Explore the Simple portfolio">
          <div className={styles.simplePreview} aria-hidden="true"><div className={styles.previewBar}>V / S <span>01 — SIMPLE</span></div><div className={styles.previewBody}><div><strong>Vikram Singh.<br/><em>AI product engineer.</em></strong><i/><i/><b>Explore my work ↗</b></div><span className={styles.asterisk}>✳</span></div><div className={styles.previewFooter}><span>WORK</span><span>EXPERIENCE</span><span>CONVERSATION</span></div></div>
          <div className={styles.description}><h2>Simple</h2><span className={styles.enter}>↗</span></div>
        </a></Link>
        </div>
        <div className={`${styles.pane} ${styles.darkPane}`} data-cursor-theme="glossy">
        <Link href="/after-hours"><a className={styles.card} aria-label="Explore the After Hours portfolio">
          <div className={styles.glossyPreview} aria-hidden="true"><div className={styles.previewBar}>V / S <span>02 — AFTER HOURS</span></div><div className={styles.orb}/><div className={styles.glass}><span>VIKRAM SINGH</span><strong>Signals into<br/><em>systems.</em></strong><div><i/><i/><i/></div></div><span className={styles.concept}>FOLLOW THE SIGNAL</span></div>
          <div className={styles.description}><h2>After Hours</h2><span className={styles.soon}>EXPLORE ↗</span></div>
        </a></Link>
        </div>
      </div>
    </main>
  </>;
}
