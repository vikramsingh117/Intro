import { useEffect, useRef } from 'react';
import styles from '../../styles/Workbench.module.css';
import { PAPER_AIM_Y } from './paperAim.mjs';

export default function PaperFlick({ controls, onCancel, remaining }) {
  const surface = useRef(null), gesture = useRef(null);
  const reset = () => { gesture.current = null; controls.current?.move(0, 0); };
  useEffect(() => {
    surface.current?.focus({ preventScroll: true });
    const blur = () => { gesture.current = null; controls.current?.move(0, 0); };
    window.addEventListener('blur', blur);
    return () => window.removeEventListener('blur', blur);
  }, [controls]);
  const sample = event => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return null;
    if (g.kind === 'orbit') {
      controls.current?.rotate(event.clientX - g.lastX, event.clientY - g.lastY);
      g.lastX = event.clientX; g.lastY = event.clientY;
      return g;
    }
    const now = performance.now();
    g.samples.push({ x: event.clientX, y: event.clientY, t: now });
    g.samples = g.samples.filter(point => now - point.t <= 100);
    controls.current?.move(event.clientX - g.x, event.clientY - g.y);
    return g;
  };
  return <div ref={surface} data-native-cursor className={styles.paperFlick} role="dialog" aria-modal="true" aria-label={`Flick to throw. ${remaining} paper balls remaining. Drag away from the ball to rotate the camera. The next ball is readied automatically.`} tabIndex={-1}
    onKeyDown={event => {
      event.stopPropagation();
      if (event.key === 'Escape') { event.preventDefault(); onCancel(); }
      if (event.key === 'Tab') { event.preventDefault(); surface.current.querySelector('button')?.focus(); }
      if (event.key.startsWith('Arrow')) {
        if (event.repeat) { event.preventDefault(); return; }
        event.preventDefault();
        controls.current?.flick(event.key === 'ArrowLeft' ? -.9 : event.key === 'ArrowRight' ? .9 : 0, event.key === 'ArrowUp' ? -.9 : event.key === 'ArrowDown' ? .9 : 0);
      }
    }}
    onPointerDown={event => {
      if (event.button !== 0 || gesture.current || event.target.closest('button')) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const onBall = Math.hypot(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height * PAPER_AIM_Y) <= rect.height * .16;
      if (onBall && !controls.current?.ready()) return;
      const now = performance.now();
      gesture.current = { kind: onBall ? 'throw' : 'orbit', id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, samples: [{ x: event.clientX, y: event.clientY, t: now }] };
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={sample}
    onPointerUp={event => {
      const g = sample(event);
      if (!g) return;
      if (g.kind === 'orbit') {
        gesture.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        return;
      }
      const first = g.samples[0], last = g.samples[g.samples.length - 1];
      const seconds = Math.max(.016, (last.t - first.t) / 1000);
      const rect = event.currentTarget.getBoundingClientRect(), scale = Math.min(rect.width, rect.height);
      const distance = Math.hypot(event.clientX - g.x, event.clientY - g.y);
      if (distance >= 8) controls.current?.flick((last.x - first.x) / seconds / scale, (last.y - first.y) / seconds / scale);
      else controls.current?.move(0, 0);
      gesture.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }} onPointerCancel={reset} onLostPointerCapture={() => { if (gesture.current) reset(); }}>
    <div className={styles.paperFlickZone} aria-hidden="true"/>
    <p>Flick the ball to throw<span>Drag elsewhere to look around</span></p>
    <button onClick={onCancel}>Esc</button>
  </div>;
}
