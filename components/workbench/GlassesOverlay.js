// Draws the selected glasses and lens status above the 3D scene while post-processing runs beneath it.
// Escape or the take-off control starts a coordinated exit, keeping the overlay mounted through its animation.
import { useEffect, useRef, useState } from 'react';
import styles from '../../styles/Workbench.module.css';

const LENSES = [
  { id: 'blur', label: 'Blur' },
  { id: 'pixel', label: 'Pixelated' },
  { id: 'crayon', label: 'Crayon' },
  { id: 'sketch', label: 'Sketch' },
];

export default function GlassesOverlay({ reduced, lens: lensId, onLeaving, onRemove }) {
  const [leaving, setLeaving] = useState(false);
  const finish = useRef(onRemove);
  finish.current = onRemove;
  const remove = () => {
    if (leaving) return;
    onLeaving?.();
    setLeaving(true);
  };
  useEffect(() => {
    const escape = event => {
      if (event.key !== 'Escape') return;
      event.preventDefault(); event.stopPropagation();
      if (!leaving) { onLeaving?.(); setLeaving(true); }
    };
    window.addEventListener('keydown', escape, true);
    return () => window.removeEventListener('keydown', escape, true);
  }, [leaving, onLeaving]);
  useEffect(() => {
    if (!leaving) return;
    // Keep the glasses mounted until the removal animation finishes.
    const timer = setTimeout(() => finish.current(), reduced ? 0 : 500);
    return () => clearTimeout(timer);
  }, [leaving, reduced]);
  const lensIndex = Math.max(0, LENSES.findIndex(lens => lens.id === lensId));
  const lens = LENSES[lensIndex];
  return <div className={styles.glassesOverlay} data-leaving={leaving} data-reduced={reduced} data-lens={lens.id}
    onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();remove();}}}>
    <div className={styles.glassesControls}>
      <span className={styles.lensStatus} aria-live="polite">Lens · {lens.label}</span>
      <button data-glasses-control className={styles.removeGlasses} onClick={remove}>Take off · Esc</button>
    </div>
    <div className={styles.glassesFrames} aria-hidden="true"><div className={styles.glassesLens}/><div className={styles.glassesBridge}/><div className={styles.glassesLens}/></div>
  </div>;
}
