// Renders the desktop-only right-edge zoom scale and its restrained interaction sound.
// It subscribes to camera state through roomZoomBridge, then sends drag, wheel, and keyboard changes back to WorkbenchScene.
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatZoomMultiplier, roomZoomBridge, ZOOM_TICK_COUNT, zoomTickForProgress } from './cameraZoom.mjs';
import styles from '../../styles/Workbench.module.css';

const INITIAL_ZOOM = { progress: .5, multiplier: 1, enabled: false };

export default function DesktopZoomControl({ disabled = false }) {
  const [api, setApi] = useState(roomZoomBridge.getApi);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const rail = useRef(null);
  const hideTimer = useRef(null);
  const audio = useRef(null);
  const previousTick = useRef(null);
  const soundArmed = useRef(false);
  const lastSoundAt = useRef(-Infinity);

  useEffect(() => roomZoomBridge.subscribe(setApi), []);

  const keepVisible = useCallback(() => {
    if (disabled) return;
    setVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 1800);
  }, [disabled]);

  useEffect(() => {
    const onPointerMove = event => {
      if (event.pointerType === 'mouse') keepVisible();
    };
    const onWheel = () => { if (!disabled) soundArmed.current = true; };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('wheel', onWheel, { capture: true, passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, [disabled, keepVisible]);

  const playTick = useCallback(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = audio.current || (audio.current = new AudioContext());
    if (context.state === 'suspended') context.resume().catch(() => {});
    const start = context.currentTime;
    if (start - lastSoundAt.current < .09) return;
    lastSoundAt.current = start;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, start);
    gain.gain.setValueAtTime(.014, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .028);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + .029);
  }, []);

  useEffect(() => {
    if (!api) return;
    previousTick.current = null;
    const update = next => {
      setZoom(next);
      const tick = zoomTickForProgress(next.progress);
      if (soundArmed.current && previousTick.current !== null && tick !== previousTick.current) playTick();
      soundArmed.current = false;
      previousTick.current = tick;
    };
    update(api.getSnapshot());
    return api.subscribe(update);
  }, [api, playTick]);

  useEffect(() => {
    if (!disabled) return;
    setVisible(false);
    setDragging(false);
    clearTimeout(hideTimer.current);
  }, [disabled]);

  useEffect(() => () => {
    clearTimeout(hideTimer.current);
    audio.current?.close().catch(() => {});
  }, []);

  const setFromPointer = useCallback(clientY => {
    const bounds = rail.current?.getBoundingClientRect();
    if (!bounds || !api) return;
    soundArmed.current = true;
    api.setProgress(1 - (clientY - bounds.top) / bounds.height);
  }, [api]);

  const onPointerDown = event => {
    if (disabled || !zoom.enabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    clearTimeout(hideTimer.current);
    setVisible(true);
    setDragging(true);
    setFromPointer(event.clientY);
  };
  const onPointerMove = event => {
    if (dragging) setFromPointer(event.clientY);
  };
  const stopDragging = event => {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    keepVisible();
  };
  const onKeyDown = event => {
    const direction = event.key === 'ArrowUp' || event.key === 'PageUp' ? 1 : event.key === 'ArrowDown' || event.key === 'PageDown' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    soundArmed.current = true;
    api?.setProgress(zoom.progress + direction / (ZOOM_TICK_COUNT - 1));
    keepVisible();
  };

  const label = formatZoomMultiplier(zoom.multiplier);
  return <div className={styles.zoomControl} data-visible={visible || dragging} data-dragging={dragging} aria-hidden={disabled || !zoom.enabled}>
    <output className={styles.zoomValue}>{label}</output>
    <div ref={rail} className={styles.zoomRail} role="slider" tabIndex={disabled || !zoom.enabled ? -1 : 0}
      aria-label="Room zoom" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(zoom.progress * 100)} aria-valuetext={label}
      onFocus={keepVisible} onBlur={() => !dragging && setVisible(false)} onKeyDown={onKeyDown}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={stopDragging} onPointerCancel={stopDragging}>
      <span className={styles.zoomTicks} aria-hidden="true">
        {Array.from({ length: ZOOM_TICK_COUNT }, (_, index) => <i key={index} className={index === zoomTickForProgress(zoom.progress) ? styles.zoomTickActive : undefined}/>) }
      </span>
      <span className={styles.zoomThumb} style={{ bottom: `calc(${zoom.progress * 100}% - 5px)` }} aria-hidden="true"/>
    </div>
    <span className={styles.zoomHint}>DRAG TO ZOOM</span>
  </div>;
}
