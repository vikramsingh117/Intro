import { useEffect, useRef } from "react";
import styles from "../styles/ThemeCursor.module.css";

export default function ThemeCursor() {
  const cursor = useRef(null);
  const icon = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const node = cursor.current;
    let frame = 0;
    let visible = false;
    let x = 0, y = 0, targetX = 0, targetY = 0;

    const hide = () => {
      visible = false;
      node.dataset.visible = "false";
      icon.current.dataset.visible = "false";
      delete document.documentElement.dataset.chooserCursor;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const animate = () => {
      x += (targetX - x) * 0.24;
      y += (targetY - y) * 0.24;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.15) {
        frame = requestAnimationFrame(animate);
      } else {
        frame = 0;
      }
    };
    const move = event => {
      const target = event.target instanceof Element ? event.target : null;
      if (!media.matches || event.pointerType !== "mouse" || target?.closest('[data-calm="true"]') ||
          target?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false']), iframe, :disabled")) {
        hide();
        return;
      }
      targetX = event.clientX;
      targetY = event.clientY;
      const pane = target?.closest("[data-cursor-theme]");
      node.dataset.theme = pane?.dataset.cursorTheme || "simple";
      icon.current.dataset.theme = node.dataset.theme;
      icon.current.dataset.visible = String(!!pane);
      icon.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      if (pane) document.documentElement.dataset.chooserCursor = "true";
      else delete document.documentElement.dataset.chooserCursor;
      node.dataset.interactive = String(!!target?.closest("a, button, summary, [role='button'], [role='tab']"));
      if (!visible) {
        x = targetX;
        y = targetY;
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        visible = true;
        node.dataset.visible = "true";
      }
      if (!frame) frame = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", hide);
    media.addEventListener("change", hide);
    return () => {
      hide();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide, true);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", hide);
      media.removeEventListener("change", hide);
    };
  }, []);

  return <>
    <div ref={cursor} className={styles.cursor} aria-hidden="true"><span /></div>
    <div ref={icon} className={styles.icon} aria-hidden="true" />
  </>;
}
