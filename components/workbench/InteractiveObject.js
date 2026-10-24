import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { BoxHelper } from 'three';

export default function InteractiveObject({ label, onHover, children }) {
  const target = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { scene, gl, invalidate } = useThree();
  useEffect(() => {
    if (!hovered || !target.current) return;
    const objectId = target.current.uuid;
    const outline = new BoxHelper(target.current, '#e8c595');
    outline.material.transparent = true;
    outline.material.opacity = .35;
    outline.raycast = () => {};
    scene.add(outline);
    gl.domElement.style.cursor = 'pointer';
    gl.domElement.dataset.cursorObject = objectId;
    gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change', { bubbles: true }));
    invalidate();
    return () => {
      scene.remove(outline); outline.geometry.dispose(); outline.material.dispose();
      if (gl.domElement.dataset.cursorObject === objectId) {
        delete gl.domElement.dataset.cursorObject;
        gl.domElement.style.cursor = '';
        gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change', { bubbles: true }));
      }
      invalidate();
    };
  }, [hovered, scene, gl, invalidate]);
  return <group ref={target}
    onPointerOver={event => { event.stopPropagation(); setHovered(true); onHover(label); }}
    onPointerOut={() => { setHovered(false); onHover(''); }}>
    {children}
  </group>;
}
