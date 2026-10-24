import Head from 'next/head';
import Link from 'next/link';
import ProductWorkbench from '../components/workbench/ProductWorkbench';
import styles from '../styles/Workbench.module.css';

export default function WorkbenchPreview() {
  return <main className={styles.page}>
    <Head><title>Workspace — Beyond Hours</title><meta name="description" content="An interactive exploration of product decisions, AI integration, and operations." /><meta name="theme-color" content="#0d1418" /></Head>
    <header className={styles.header}><Link href="/simple"><a>VS / BEYOND HOURS</a></Link><span>COMPONENT EXPLORATION</span></header>
    <div className={styles.intro}><p>PRODUCT × AI × ENGINEERING</p><h1>A window into<br /><em>how I build.</em></h1><div>Enter the monitor to explore my work, then step back out.</div></div>
    <ProductWorkbench />
    <details className={styles.credits}><summary>Asset credits</summary><p><a href="https://sketchfab.com/3d-models/keyboard-cc7e7ed38d9a469ea499893295bc767a" target="_blank" rel="noreferrer">Keyboard</a> by <a href="https://sketchfab.com/thethieme" target="_blank" rel="noreferrer">thethieme</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Scaled and positioned for this scene; original geometry and textures retained.</p><p><a href="https://sketchfab.com/3d-models/lowpoly-berlin-u-bahn-station-2a02d3f2eccf4cd29bbaa1348787395e" target="_blank" rel="noreferrer">Lowpoly Berlin U-bahn Station</a> by <a href="https://sketchfab.com/n-malmberg" target="_blank" rel="noreferrer">n-malmberg</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Scaled and centered; legacy materials approximated for this viewer.</p><p>Monitor: Kenney (CC0). Desk lamp: Grab3D (CC0).</p></details>
    <footer className={styles.footer}><span>BEYOND HOURS / WORKSPACE PROTOTYPE</span><span>Built to explore. Designed to stay readable.</span></footer>
  </main>;
}
