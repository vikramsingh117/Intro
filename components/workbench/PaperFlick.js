// Provides the accessible screen-space gesture layer for aiming and flicking a held paper ball.
// Pointer and keyboard input are translated into the physics controls owned by PaperBalls, with Escape returning to the room.
import { useEffect, useRef } from 'react';
import styles from '../../styles/Workbench.module.css';
import { PAPER_AIM_Y } from './paperAim.mjs';

const FLICK_DISTANCE = 36;

export default function PaperFlick({ controls, onCancel, remaining }) {
  const surface = useRef(null), gesture = useRef(null);
  const clearGuide = () => {
    if (!surface.current) return;
    delete surface.current.dataset.flickDragging;
    delete surface.current.dataset.flickReady;
  };
  const reset = () => { gesture.current = null; clearGuide(); controls.current?.move(0, 0); };
  useEffect(() => {
    surface.current?.focus({ preventScroll: true });
    const blur = () => {
      gesture.current = null;
      if(surface.current){delete surface.current.dataset.flickDragging;delete surface.current.dataset.flickReady;}
      controls.current?.move(0, 0);
    };
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
    const dx=event.clientX-g.x, dy=event.clientY-g.y, distance=Math.hypot(dx,dy);
    surface.current.style.setProperty('--flick-distance',`${distance}px`);
    surface.current.style.setProperty('--flick-angle',`${Math.atan2(dy,dx)}rad`);
    surface.current.dataset.flickReady=String(distance>=FLICK_DISTANCE);
    controls.current?.move(dx,dy);
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
      if(onBall){
        event.currentTarget.style.setProperty('--flick-start-x',`${event.clientX-rect.left}px`);
        event.currentTarget.style.setProperty('--flick-start-y',`${event.clientY-rect.top}px`);
        event.currentTarget.style.setProperty('--flick-distance','0px');
        event.currentTarget.dataset.flickDragging='true';
        event.currentTarget.dataset.flickReady='false';
      }
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
      const dx=event.clientX-g.x, dy=event.clientY-g.y, distance=Math.hypot(dx,dy);
      let vx=(last.x-first.x)/seconds/scale, vy=(last.y-first.y)/seconds/scale;
      if(distance>=FLICK_DISTANCE && Math.hypot(vx,vy)<.13){vx=dx/distance*.13;vy=dy/distance*.13;}
      if (distance >= FLICK_DISTANCE) controls.current?.flick(vx,vy);
      else controls.current?.move(0, 0);
      gesture.current = null;
      clearGuide();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }} onPointerCancel={reset} onLostPointerCapture={() => { if (gesture.current) reset(); }}>
    <div className={styles.paperFlickZone} aria-hidden="true"/>
    <p>Flick to throw</p>
    <button onClick={onCancel}>Esc</button>
  </div>;
}
