import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { BoxHelper } from 'three';

export default function InteractiveObject({ label, onHover, children }) {
  const target = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { scene, gl, invalidate } = useThree();
  useEffect(() => {
    if (!hovered || !target.current) return;
    const outline = new BoxHelper(target.current, '#e8c595');
    outline.material.transparent = true;
    outline.material.opacity = .35;
    outline.raycast = () => {};
    scene.add(outline);
    gl.domElement.style.cursor = 'pointer';
    invalidate();
    return () => {
      scene.remove(outline); outline.geometry.dispose(); outline.material.dispose();
      gl.domElement.style.cursor = ''; invalidate();
    };
  }, [hovered, scene, gl, invalidate]);
  return <group ref={target}
    onPointerOver={event => { event.stopPropagation(); setHovered(true); onHover(label); }}
    onPointerOut={() => { setHovered(false); onHover(''); }}>
    {children}
  </group>;
}
