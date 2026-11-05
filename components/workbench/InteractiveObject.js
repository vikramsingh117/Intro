import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { BoxHelper } from 'three';
import { installRoomHitboxes } from './roomHitboxes.mjs';

export default function InteractiveObject({ label, onHover, focused = false, moving = false, children }) {
  const target = useRef(null);
  const outlineRef = useRef(null);
  useFrame(()=>{if(moving && outlineRef.current?.visible)outlineRef.current.update();});
  const [hovered, setHovered] = useState(false);
  const { scene, gl, invalidate } = useThree();
  useLayoutEffect(() => {
    target.current.updateWorldMatrix(true, true);
    const restoreHitboxes = installRoomHitboxes(target.current);
    const outline = new BoxHelper(target.current, '#e8c595');
    outlineRef.current=outline;
    outline.material.transparent = true;
    outline.material.opacity = .35;
    outline.raycast = () => {};
    outline.visible = false;
    scene.add(outline);
    return () => {
      restoreHitboxes();
      outlineRef.current=null;
      scene.remove(outline); outline.geometry.dispose(); outline.material.dispose();
    };
  }, [scene]);
  useEffect(() => {
    const outline = outlineRef.current;
    if (!outline) return;
    outline.visible = hovered || focused;
    if (outline.visible && moving) outline.update();
    invalidate();
  }, [hovered, focused, moving, invalidate]);
  useEffect(() => {
    const objectId = target.current.uuid;
    if (hovered) {
      gl.domElement.style.cursor = 'pointer';
      gl.domElement.dataset.cursorObject = objectId;
      gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change', { bubbles: true }));
    }
    return () => {
      if (gl.domElement.dataset.cursorObject === objectId) {
        delete gl.domElement.dataset.cursorObject;
        gl.domElement.style.cursor = '';
        gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change', { bubbles: true }));
      }
    };
  }, [hovered, gl]);
  return <group ref={target}
    onPointerOver={event => { event.stopPropagation(); setHovered(true); onHover(label); }}
    onPointerOut={() => { setHovered(false); onHover(''); }}>
    {children}
  </group>;
}
