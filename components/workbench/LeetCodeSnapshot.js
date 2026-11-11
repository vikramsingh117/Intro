import { useEffect, useRef, useState } from 'react';
import PixelDeskScene from './PixelDeskScene';
import styles from '../../styles/AboutJourney.module.css';

// Values transcribed from the screenshot supplied by Vikram; not a live API feed.
const DIFFICULTY = [
  { label: 'Easy', solved: 222, total: 975, color: '#34b8ab' },
  { label: 'Medium', solved: 298, total: 2146, color: '#e8b443' },
  { label: 'Hard', solved: 14, total: 989, color: '#df6563' },
];
export default function LeetCodeSnapshot({ month, onBack, backRef, radioPlaying, ceilingOn }) {
  const [zooming, setZooming] = useState(true);
  const objects = useRef({});
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setZooming(false); return; }
    const timer = setTimeout(() => setZooming(false), 500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { if (!zooming) backRef.current?.focus({preventScroll:true}); }, [zooming, backRef]);
  if (zooming) return <div className={styles.leetcodeZoomViewport}><div className={styles.leetcodeZoom}><PixelDeskScene month={month} disabled radioPlaying={radioPlaying} ceilingOn={ceilingOn} objectRefs={objects}/></div></div>;
  return <section className={styles.leetcodeView} aria-label="LeetCode profile snapshot">
    <header className={styles.closeupBar}><button ref={backRef} onClick={onBack}>← Desk</button><span>LEETCODE / SAVED SNAPSHOT</span><a href="https://leetcode.com/u/vikramandanshu/" target="_blank" rel="noopener noreferrer">Live profile ↗</a></header>
    <div className={styles.leetcodeContent}>
      <aside className={styles.leetcodeProfile}>
        <div className={styles.leetcodeAvatar} aria-hidden="true">🥹</div><h3>vikram singh</h3><p>vikramandanshu</p>
        <small>PROFILE RANK</small><strong>190,208</strong>
        <dl><dt>Views</dt><dd>68</dd><dt>Solutions</dt><dd>19</dd><dt>Reputation</dt><dd>2</dd></dl>
        <small>LANGUAGES / SOLVED</small><dl><dt>Python3</dt><dd>496</dd><dt>MySQL</dt><dd>23</dd><dt>C</dt><dd>14</dd></dl>
      </aside>
      <div className={styles.leetcodeStats}>
        <section className={styles.leetcodeCard}><div className={styles.contestMetrics}>
          <div><small>CONTEST RATING</small><strong>1,471</strong></div>
          <div><small>GLOBAL RANKING</small><strong>481,238</strong><small>of 891,547</small></div>
          <div><small>ATTENDED</small><strong>3</strong></div>
          <div><small>TOP</small><strong>54.42%</strong></div>
        </div></section>
        <section className={styles.leetcodeCard}>
          <div className={styles.solvedLayout}>
            <div className={styles.solvedRing}><div><strong>534</strong><span> / 4,110</span><small>✓ SOLVED</small><small>28 attempting</small></div></div>
            <div className={styles.difficultyList}>{DIFFICULTY.map(item=><div key={item.label} style={{'--difficulty-color':item.color}}><div><span>{item.label}</span><b>{item.solved}<small> / {item.total}</small></b></div><div className={styles.difficultyTrack}><i style={{width:`${item.solved / 534 * 100}%`}}/></div></div>)}</div>
          </div>
        </section>
        <div className={styles.leetcodeBottom}>
          <section className={styles.leetcodeCard}><small>BADGES</small><strong>5</strong><div className={styles.pixelBadge} aria-hidden="true">365</div><p>365 Days Badge</p></section>
          <section className={styles.leetcodeCard}><small>PAST YEAR · IN SCREENSHOT</small><strong>185</strong><p>submissions</p><dl><dt>Active days</dt><dd>52</dd><dt>Max streak</dt><dd>11</dd></dl></section>
        </div>
      </div>
      <p className={styles.snapshotNote}>From your supplied screenshot. These figures are not live or a verified year-specific snapshot.</p>
    </div>
  </section>;
}
