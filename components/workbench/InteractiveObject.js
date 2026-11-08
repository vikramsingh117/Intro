import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3Helper } from 'three';
import { createRoomBounds, installObjectHover } from './roomHover.mjs';
import { installRoomHitboxes } from './roomHitboxes.mjs';

export default function InteractiveObject({ label, onHover, focused = false, moving = false, children }) {
  const target = useRef(null);
  const outlineRef = useRef(null);
  const boundsRef = useRef(null);
  const hoverRef = useRef(false);
  useFrame(()=>{if(moving)boundsRef.current?.update();}, .25);
  const [hovered, setHovered] = useState(false);
  const { scene, gl, invalidate } = useThree();
  useLayoutEffect(() => {
    target.current.updateWorldMatrix(true, true);
    const restoreHitboxes = installRoomHitboxes(target.current);
    const bounds = createRoomBounds(target.current);
    boundsRef.current = bounds;
    const restoreHover = installObjectHover(target.current, bounds.box);
    const outline = new Box3Helper(bounds.box, '#e8c595');
    outlineRef.current=outline;
    outline.material.transparent = true;
    outline.material.opacity = .35;
    outline.raycast = () => {};
    outline.visible = false;
    scene.add(outline);
    return () => {
      restoreHover();
      restoreHitboxes();
      boundsRef.current=null;
      outlineRef.current=null;
      scene.remove(outline); outline.geometry.dispose(); outline.material.dispose();
    };
  }, [scene]);
  useEffect(() => {
    const outline = outlineRef.current;
    if (!outline) return;
    const visible = hovered || focused;
    if (outline.visible !== visible) { outline.visible = visible; invalidate(); }
  }, [hovered, focused, moving, invalidate]);
  useEffect(() => {
    const objectId = target.current.uuid;
    if (hovered) {

      gl.domElement.dataset.cursorObject = objectId;
      gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change', { bubbles: true }));
    }
    return () => {
      if (gl.domElement.dataset.cursorObject === objectId) {
        delete gl.domElement.dataset.cursorObject;

        gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change', { bubbles: true }));
      }
    };
  }, [hovered, gl]);
  return <group ref={target}
    onPointerOver={event => { event.stopPropagation(); if(hoverRef.current)return; hoverRef.current=true; setHovered(true); onHover(label); }}
    onPointerOut={() => { if(!hoverRef.current)return; hoverRef.current=false; setHovered(false); onHover(''); }}>
    {children}
  </group>;
}
