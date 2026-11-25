// Drives the fine-pointer custom cursor across chooser themes and interactive room targets.
// It falls back to native cursors for form controls, embedded content, coarse pointers, and reduced-motion users.
import { useEffect, useRef } from "react";
import styles from "../styles/ThemeCursor.module.css";

export default function ThemeCursor() {
  const cursor = useRef(null);
  const icon = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const node = cursor.current;
    let visible = false;
    let hoveredTarget = null;
    let spin = null;
    let aimCenter = null;
    let aimOrigin = null;
    let aimPoint = null;
    let lastPointer = null;
    let aimMotion = null;
    const place = ([x,y]) => { node.style.transform = `translate3d(${x}px, ${y}px, 0)`; };
    const glide = (from,to,duration=480) => {
      if (!from || !node.animate) { place(to); return; }
      aimMotion?.cancel();
      const start=`translate3d(${from[0]}px, ${from[1]}px, 0)`,end=`translate3d(${to[0]}px, ${to[1]}px, 0)`;
      node.style.transform=start;
      const motion=node.animate([{transform:start},{transform:end}],{duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
      aimMotion=motion;
      motion.onfinish=()=>{
        if(aimMotion!==motion)return;
        // Persist the destination as an inline transform, then release the
        // fill-forwards animation so live pointer movement can take over again.
        place(to);
        motion.cancel();
        aimMotion=null;
      };
    };
    const updateHover = target => {
      const next = target?.tagName === 'CANVAS'
        ? target.dataset.cursorObject || null
        : target?.closest("a, button, summary, [role='button'], [role='tab']") || null;
      node.dataset.interactive = String(!!next);
      if (next && next !== hoveredTarget && media.matches && target?.closest('[data-cursor-theme="glossy"]')) {
        spin?.cancel();
        spin = node.firstElementChild.animate([{ transform: 'rotate(45deg)' }, { transform: 'rotate(135deg)' }], {
          duration: 700, easing: 'ease-in-out', iterations: 1, fill: 'forwards',
        });
      }
      hoveredTarget = next;
    };
    const objectHover = event => { if (!event.target?.closest('[data-native-cursor]')) updateHover(event.target); };

    const hide = () => {
      if (!visible && !document.documentElement.dataset.chooserCursor) return;
      visible = false;
      hoveredTarget = null;
      aimCenter = null;
      aimOrigin = null;
      aimPoint = null;
      aimMotion?.cancel();
      aimMotion = null;
      spin?.cancel();
      node.dataset.visible = "false";
      icon.current.dataset.visible = "false";
      delete document.documentElement.dataset.chooserCursor;
    };
    const move = event => {
      const target = event.target instanceof Element ? event.target : null;
      if (!media.matches || event.pointerType !== "mouse" || target?.closest('[data-calm="true"]') ||
          target?.closest("input, textarea, select, [data-native-cursor], [contenteditable]:not([contenteditable='false']), iframe, :disabled")) {
        hide();
        return;
      }
      lastPointer = [event.clientX,event.clientY];
      if (!aimCenter) {
        aimMotion?.cancel();
        aimMotion=null;
        place(lastPointer);
      } else if (!aimMotion) place(aimPoint||lastPointer);
      const pane = target?.closest("[data-cursor-theme]");
      node.dataset.theme = pane?.dataset.cursorTheme || "simple";
      icon.current.dataset.theme = node.dataset.theme;
      icon.current.dataset.visible = String(!!pane);
      if (pane) document.documentElement.dataset.chooserCursor = "true";
      else delete document.documentElement.dataset.chooserCursor;
      updateHover(target);
      if (!visible) {
        visible = true;
        node.dataset.visible = "true";
      }
    };
    const roomZoomAim = event => {
      if (!media.matches) return;
      if (event.detail?.active) {
        const nextCenter=[event.detail.x,event.detail.y];
        if(!aimCenter){
          aimOrigin=lastPointer||nextCenter;
          aimPoint=aimOrigin;
        }
        const progress=Math.max(0,Math.min(1,Number(event.detail.progress)||0));
        const nextPoint=[
          aimOrigin[0]+(nextCenter[0]-aimOrigin[0])*progress,
          aimOrigin[1]+(nextCenter[1]-aimOrigin[1])*progress,
        ];
        const from=aimPoint||aimOrigin;
        aimCenter=nextCenter;
        aimPoint=nextPoint;
        glide(from,aimPoint,140);
        node.dataset.theme = 'glossy';
        node.dataset.interactive = 'true';
        node.dataset.visible = 'true';
        icon.current.dataset.theme = 'glossy';
        icon.current.dataset.visible = 'true';
        document.documentElement.dataset.chooserCursor = 'true';
        visible = true;
      } else {
        const from=aimPoint;
        aimCenter = null;
        aimOrigin = null;
        aimPoint = null;
        if (lastPointer) glide(from||lastPointer,lastPointer,360);
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener('cursor-object-change', objectHover);
    window.addEventListener('room-zoom-cursor',roomZoomAim);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", hide);
    media.addEventListener("change", hide);
    return () => {
      hide();
      window.removeEventListener("pointermove", move);
      window.removeEventListener('cursor-object-change', objectHover);
      window.removeEventListener('room-zoom-cursor',roomZoomAim);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide, true);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", hide);
      media.removeEventListener("change", hide);
    };
  }, []);

  // One translated layer keeps the icon and rotating glow exactly together.
  return <div ref={cursor} className={styles.cursor} aria-hidden="true">
    <span />
    <div ref={icon} className={styles.icon} />
  </div>;
}
