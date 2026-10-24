import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/ThemeChooser.module.css";

export default function ThemeChooser() {
  const router = useRouter();
  const [stage, setStage] = useState('simple');
  const [Preloader, setPreloader] = useState(null);
  const [total, setTotal] = useState(8);
  const [loaded, setLoaded] = useState(0);
  const [codeReady, setCodeReady] = useState(false);
  const [selected, setSelected] = useState(false);
  const completed = useRef(new Set());
  const onLoaded = useCallback(url => {
    completed.current.add(url);
    setLoaded(completed.current.size);
  }, []);
  const onError = useCallback(() => setStage('error'), []);
  useEffect(() => {
    let active = true;
    async function prepare() {
      try {
        // Finish the lightweight route before requesting any 3D code or assets.
        await Promise.all([
          router.prefetch('/simple', undefined, { priority: true }),
          import('./simple'),
        ]);
        if (!active) return;
        setStage('loading');
        const module = await import('../components/workbench/PreloadAssets');
        if (!active) return;
        setTotal(module.ASSET_COUNT);
        setPreloader(() => module.default);
        await Promise.all([
          router.prefetch('/after-hours', undefined, { priority: true }),
          import('../components/workbench/WorkbenchScene'),
        ]);
        if (active) setCodeReady(true);
      } catch { if (active) setStage('error'); }
    }
    prepare();
    return () => { active = false; };
  }, [router]);
  const ready = loaded === total && codeReady && stage !== 'error';
  useEffect(() => {
    if (selected && ready) router.push('/after-hours').catch(onError);
  }, [selected, ready, router, onError]);
  const percent = Math.round(loaded / total * 100);
  const status = stage === 'simple' ? 'Loading Simple first…'
    : stage === 'error' ? 'Preload interrupted · click to open'
    : ready ? 'Ready to explore ↗'
    : loaded === total ? 'Preparing the room…'
    : `Downloading room · ${percent}%`;
  return <>
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
        <a href="/after-hours" className={styles.card} aria-label="Explore the After Hours portfolio" aria-describedby="room-progress" onClick={event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          event.preventDefault();
          if (!ready && stage !== 'error') setSelected(true);
          else router.push('/after-hours').catch(onError);
        }}>
          <div className={styles.glossyPreview} aria-hidden="true"><div className={styles.previewBar}>V / S <span>02 — AFTER HOURS</span></div><div className={styles.orb}/><div className={styles.glass}><span>VIKRAM SINGH</span><strong>Step into<br/><em>my workspace.</em></strong><div><i/><i/><i/></div></div><span className={styles.concept}>EXPLORE THE ROOM</span></div>
          <div className={styles.description}><h2>After Hours</h2><span className={styles.soon}>{selected && !ready ? "OPENING…" : "EXPLORE ↗"}</span></div>
          <div className={styles.loadStatus} id="room-progress">
            <span role="status">{status}</span>
            <progress aria-label="After Hours assets downloaded" value={loaded} max={total}/>
            <small>{stage === 'loading' && !ready ? `${loaded} / ${total} assets · models include their textures` : selected && !ready && stage !== 'error' ? 'The room will open automatically when ready.' : ' '}</small>
          </div>
        </a>
        </div>
      </div>
      {Preloader && <Preloader onLoaded={onLoaded} onError={onError}/>}
    </main>
  </>;
}
