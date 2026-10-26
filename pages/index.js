import { prepareRadioEntrance, cancelRadioEntrance } from '../components/workbench/radioEntrance';
import SocialPreview from "../components/SocialPreview";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAfterHoursPreload } from "../components/AfterHoursPreload";
import { useAfterHoursTransition } from "../components/AfterHoursTransition";
import styles from "../styles/ThemeChooser.module.css";

export default function ThemeChooser() {
  const { enter } = useAfterHoursTransition();
  const preview = useRef(null);
  useEffect(()=>()=>{ if(window.location.pathname!=='/after-hours')cancelRadioEntrance(); },[]);
  const { stage, progress, ready } = useAfterHoursPreload();
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    if (selected && (ready || stage === 'error')) {
      setSelected(false);
      enter(preview.current);
    }
  }, [selected, ready, stage, enter]);
  return <>
    <SocialPreview path="/" title="Vikram Singh — AI Product Engineer" description="Explore my work in AI engineering and product development, through a readable portfolio or a cozy interactive workspace." />
    <Head>
      <title>Vikram Singh — Choose your experience</title>
      <meta name="description" content="Explore Vikram Singh’s portfolio: Simple, an editorial overview, or After Hours, a cozy interactive workspace." />
      <meta name="theme-color" content="#f4f1e8" />
    </Head>
    <main className={styles.page}>
      <h1 className={styles.srOnly}>Choose your portfolio experience</h1>
      <div className={styles.options}>
        <div className={styles.pane} data-cursor-theme="simple">
        <Link href="/simple" prefetch={false}><a className={styles.card} aria-label="Explore the Simple portfolio">
          <div className={styles.simplePreview} aria-hidden="true"><div className={styles.previewBar}>V / S <span>01 — SIMPLE</span></div><div className={styles.previewBody}><div><strong>Vikram Singh.<br/><em>AI product engineer.</em></strong><i/><i/><b>Explore my work ↗</b></div><span className={styles.asterisk}>✳</span></div><div className={styles.previewFooter}><span>WORK</span><span>EXPERIENCE</span><span>CONVERSATION</span></div></div>
          <div className={styles.description}><h2>Simple</h2><span className={styles.enter}>↗</span></div>
        </a></Link>
        </div>
        <div className={`${styles.pane} ${styles.darkPane}`} data-cursor-theme="glossy">
        {/* Explicit navigation prevents Next Link's hover prefetch from bypassing Simple-first loading. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/after-hours" className={styles.card} aria-label="Explore the After Hours portfolio" aria-busy={!ready && stage !== 'error'} onClick={event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          event.preventDefault();
          prepareRadioEntrance();
          if (!ready && stage !== 'error') setSelected(true);
          else enter(preview.current);
        }}>
          <div ref={preview} className={`${styles.glossyPreview} ${styles.loadingPreview}`} style={{ "--download-progress": `${progress}%` }} aria-hidden="true"><div className={styles.unloadedCover}/><div className={styles.previewBar}>V / S <span>02 — AFTER HOURS</span></div><span className={styles.concept}>EXPLORE THE ROOM</span></div>
          <div className={styles.description}><h2>After Hours <span className={styles.recommended}>recommended</span></h2><span className={styles.soon}>↗</span></div>
          <span className={styles.srOnly} role="progressbar" aria-label="After Hours download" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}/>
        </a>
        </div>
      </div>
      <Link href="/privacy"><a className={styles.privacyLink}>Privacy</a></Link>
    </main>
  </>;
}
