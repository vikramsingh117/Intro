import { cancelRadioEntrance } from './workbench/radioEntrance';
import { createContext, useCallback, useContext, useRef } from 'react';
import { useRouter } from 'next/router';

const TransitionContext = createContext({ enter: () => {}, sceneReady: () => {} });
export const useAfterHoursTransition = () => useContext(TransitionContext);

// This layer survives the route change, keeping the cut completely black until the room renders.
export default function AfterHoursTransition({ children }) {
  const router = useRouter();
  const layer = useRef(null);
  const busy = useRef(false);
  const reveal = useRef(null);
  const sceneReady = useCallback(() => reveal.current?.(), []);
  const enter = useCallback(async source => {
    if (busy.current || !source || !layer.current) return;
    busy.current = true;
    const host = layer.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rect = source.getBoundingClientRect();
    const preview = source.cloneNode(true);
    Object.assign(preview.style, {
      position: 'absolute', left: `${rect.left}px`, top: `${rect.top}px`,
      width: `${rect.width}px`, height: `${rect.height}px`, margin: '0',
      boxSizing: 'border-box', transformOrigin: 'center',
    });
    const shade = document.createElement('div');
    Object.assign(shade.style, { position: 'absolute', inset: '0', background: '#000', opacity: '0' });
    host.replaceChildren(preview, shade);
    host.style.display = 'block';
    const animations = [];
    let timeout;
    try {
      const scale = Math.max(innerWidth / rect.width, innerHeight / rect.height) * 1.3;
      if (!reduced) animations.push(preview.animate([
        { transform: 'translate(0, 0) scale(1)' },
        { transform: `translate(${innerWidth / 2 - rect.left - rect.width / 2}px, ${innerHeight / 2 - rect.top - rect.height / 2}px) scale(${scale})` },
      ], { duration: 1150, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' }));
      const darken = shade.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: reduced ? 120 : 750, delay: reduced ? 0 : 350, fill: 'forwards', easing: 'ease-in',
      });
      animations.push(darken);
      await darken.finished;
      shade.style.opacity = '1';
      darken.cancel();
      const rendered = new Promise(resolve => {
        reveal.current = resolve;
        // Also release the curtain if WebGL fails and the accessible fallback is shown.
        timeout = setTimeout(resolve, 8000);
      });
      const navigated = await router.push('/after-hours');
      if (navigated) await rendered;
      clearTimeout(timeout);
      reveal.current = null;
      preview.remove();
      const fade = shade.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: reduced ? 150 : 1500, easing: 'ease-in-out', fill: 'forwards',
      });
      animations.push(fade);
      await fade.finished;
    } catch {
      // A cancelled/failed navigation must never leave the chooser covered.
    } finally {
      clearTimeout(timeout);
      reveal.current = null;
      animations.forEach(animation => animation.cancel());
      host.replaceChildren();
      host.style.display = 'none';
      busy.current = false;
      cancelRadioEntrance();
    }
  }, [router]);
  return <TransitionContext.Provider value={{ enter, sceneReady }}>
    {children}
    <div ref={layer} aria-hidden="true" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 2147483646, overflow: 'hidden', pointerEvents: 'auto' }} />
  </TransitionContext.Provider>;
}
