import { useEffect, useRef, useState } from 'react';
import styles from '../../styles/Workbench.module.css';

export default function GlassesOverlay({ reduced, onRemove }) {
  const [leaving, setLeaving] = useState(false);
  const finish = useRef(onRemove);
  finish.current = onRemove;
  useEffect(() => {
    const escape = event => {
      if (event.key !== 'Escape') return;
      event.preventDefault(); event.stopPropagation(); setLeaving(true);
    };
    window.addEventListener('keydown', escape, true);
    return () => window.removeEventListener('keydown', escape, true);
  }, []);
  useEffect(() => {
    if (!leaving) return;
    // Keep the glasses mounted until the removal animation finishes.
    const timer = setTimeout(() => finish.current(), reduced ? 0 : 500);
    return () => clearTimeout(timer);
  }, [leaving, reduced]);
  const remove = () => setLeaving(true);
  return <div className={styles.glassesOverlay} data-leaving={leaving} data-reduced={reduced}
    onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();remove();}}}>
    <button data-glasses-control className={styles.removeGlasses} onClick={remove}>Take off glasses · Esc</button>
    <div className={styles.glassesFrames} aria-hidden="true"><div className={styles.glassesLens}/><div className={styles.glassesBridge}/><div className={styles.glassesLens}/></div>
  </div>;
}
