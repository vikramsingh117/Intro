// Recreates the current pixel desk inside the journey monitor before handing control back to the 3D room.
// The timed transition respects reduced motion and preserves ceiling and radio state in the nested preview.
import { useEffect, useRef } from 'react';
import PixelDeskScene from './PixelDeskScene';
import styles from '../../styles/AboutJourney.module.css';

export default function InceptionMonitor({ onEnterPortfolio, lampOn, radioPlaying, ceilingOn }) {
  const objects = useRef({});
  const enter = useRef(onEnterPortfolio);
  useEffect(()=>{enter.current=onEnterPortfolio;},[onEnterPortfolio]);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(()=>enter.current?.(), reduced ? 0 : 1200);
    return () => clearTimeout(timer);
  }, []);
  return <section className={styles.inceptionJourney} aria-label="Zooming into the monitor to enter the current 3D portfolio">
    <div className={styles.deskZoomViewport}>
      <div className={styles.deskZoom}><PixelDeskScene month={60} disabled lampOn={lampOn} ceilingOn={ceilingOn} radioPlaying={radioPlaying} objectRefs={objects}/></div>
    </div>
  </section>;
}
