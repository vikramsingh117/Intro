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
      const transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      node.style.transform = transform;
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

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener('cursor-object-change', objectHover);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", hide);
    media.addEventListener("change", hide);
    return () => {
      hide();
      window.removeEventListener("pointermove", move);
      window.removeEventListener('cursor-object-change', objectHover);
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
