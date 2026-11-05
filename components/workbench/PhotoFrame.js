import { Suspense, useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace, TextureLoader } from 'three';
import InteractiveObject from './InteractiveObject';

export const PHOTO_TARGET = [4.25, -.92, -.65];

function PhotoDust() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    // Fixed grain keeps the glass patina stable across renders.
    let seed = 73;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 620; i++) {
      const x = random() * 512, y = random() * 512;
      const edge = Math.min(x, y, 512 - x, 512 - y) < 36;
      ctx.fillStyle = `rgba(221, 210, 183, ${(.08 + random() * .17) * (edge ? 1.5 : 1)})`;
      ctx.beginPath();
      ctx.ellipse(x, y, .25 + random() * .65, .25 + random() * .9, random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // A few faint fibers among the finer dust specks.
    ctx.strokeStyle = 'rgba(221, 210, 183, .15)';
    ctx.lineWidth = .65;
    for (let i = 0; i < 12; i++) {
      const x = random() * 512, y = random() * 512;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 2, y + 2, x + random() * 5 - 2, y + 3 + random() * 4);
      ctx.stroke();
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, 0, .072]}>
    <planeGeometry args={[.78, .78]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
  </mesh>;
}

function Photo() {
  const texture = useLoader(TextureLoader, '/images/workbench-framed-photo.png');
  texture.colorSpace = SRGBColorSpace;
  return <mesh position={[0, 0, .071]}>
    <planeGeometry args={[.78, .78]} />
    <meshBasicMaterial map={texture} color="#a6ada9" toneMapped={false} />
  </mesh>;
}

export default function PhotoFrame({ focused, keyboardFocused, onSelect, onHover }) {
  return <InteractiveObject focused={focused || keyboardFocused} label="Photo frame · take a closer look" onHover={onHover}>
    <group position={PHOTO_TARGET} onClick={event => { event.stopPropagation(); if (event.delta <= 5) onSelect(); }}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.12, 1.12, .12]} />
        <meshStandardMaterial color="#61432e" roughness={.65} />
      </mesh>
      <mesh position={[0, 0, .065]}>
        <planeGeometry args={[.96, .96]} />
        <meshStandardMaterial color="#eee3cf" roughness={.95} />
      </mesh>
      <mesh position={[0, 0, .07]}>
        <planeGeometry args={[.78, .78]} />
        <meshStandardMaterial color="#b6b1a1" roughness={.95} />
      </mesh>
      <Suspense fallback={null}><Photo /></Suspense>
      <PhotoDust />
      <mesh position={[0, -.28, -.23]} rotation={[-.4, 0, 0]} castShadow>
        <boxGeometry args={[.45, .55, .06]} />
        <meshStandardMaterial color="#493626" roughness={.8} />
      </mesh>
    </group>
  </InteractiveObject>;
}
