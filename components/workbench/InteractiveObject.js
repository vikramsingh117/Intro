import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { BoxHelper } from 'three';

export default function InteractiveObject({ label, onHover, focused = false, moving = false, children }) {
  const target = useRef(null);
  const outlineRef = useRef(null);
  useFrame(()=>{if(moving)outlineRef.current?.update();});
  const [hovered, setHovered] = useState(false);
  const { scene, gl, invalidate } = useThree();
  useEffect(() => {
    if ((!hovered && !focused) || !target.current) return;
    const objectId = target.current.uuid;
    const outline = new BoxHelper(target.current, '#e8c595');
    outlineRef.current=outline;
    outline.material.transparent = true;
    outline.material.opacity = .35;
    outline.raycast = () => {};
    scene.add(outline);
    if (hovered) {
      gl.domElement.style.cursor = 'pointer';
      gl.domElement.dataset.cursorObject = objectId;
      gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change', { bubbles: true }));
    }
    invalidate();
    return () => {
      outlineRef.current=null;
      scene.remove(outline); outline.geometry.dispose(); outline.material.dispose();
      if (gl.domElement.dataset.cursorObject === objectId) {
        delete gl.domElement.dataset.cursorObject;
        gl.domElement.style.cursor = '';
        gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change', { bubbles: true }));
      }
      invalidate();
    };
  }, [hovered, focused, scene, gl, invalidate]);
  return <group ref={target}
    onPointerOver={event => { event.stopPropagation(); setHovered(true); onHover(label); }}
    onPointerOut={() => { setHovered(false); onHover(''); }}>
    {children}
  </group>;
}
