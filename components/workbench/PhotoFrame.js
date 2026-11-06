import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace, TextureLoader } from 'three';
import InteractiveObject from './InteractiveObject';

export const PHOTO_TARGET = [4.25, -.92, -.65];

function Photo({ revealed, reduced }) {
  const colorMaterial = useRef(null);
  const transition = useRef(null);
  const invalidate = useThree(state => state.invalidate);
  useLayoutEffect(() => {
    transition.current = { from: colorMaterial.current.opacity, to: revealed ? 1 : 0, elapsed: 0 };
    invalidate();
  }, [revealed, reduced, invalidate]);
  useFrame((state, dt) => {
    const fade = transition.current;
    if (!fade || !colorMaterial.current) return;
    // Match the camera's duration and easing, including interrupted zooms.
    fade.elapsed += Math.min(dt, .05);
    const progress = reduced ? 1 : Math.min(1, fade.elapsed / 1.45);
    const ease = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    colorMaterial.current.opacity = fade.from + (fade.to - fade.from) * ease;
    if (progress < 1) state.invalidate();
    else transition.current = null;
  });
  const texture = useLoader(TextureLoader, '/images/workbench-framed-photo.png');
  texture.colorSpace = SRGBColorSpace;
  const outline = useMemo(() => {
    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(texture.image, 0, 0, size, size);
    const source = ctx.getImageData(0, 0, size, size);
    const luminance = new Float32Array(size * size);
    for (let i = 0; i < luminance.length; i++) {
      const offset = i * 4;
      luminance[i] = source.data[offset] * .2126 + source.data[offset + 1] * .7152 + source.data[offset + 2] * .0722;
    }
    const result = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        let edge = 0;
        if (x > 0 && x < size - 1 && y > 0 && y < size - 1) {
          // Sobel edges retain the subject and mountain contours without photo color.
          const a = luminance[i - size - 1], b = luminance[i - size], c = luminance[i - size + 1];
          const d = luminance[i - 1], f = luminance[i + 1];
          const g = luminance[i + size - 1], h = luminance[i + size], j = luminance[i + size + 1];
          const horizontal = -a + c - 2 * d + 2 * f - g + j;
          const vertical = -a - 2 * b - c + g + 2 * h + j;
          edge = Math.min(1, Math.max(0, (Math.hypot(horizontal, vertical) - 35) / 110));
        }
        // Dark charcoal with muted warm contours fits the room at rest.
        result.data[i * 4] = 23 + edge * 104;
        result.data[i * 4 + 1] = 31 + edge * 94;
        result.data[i * 4 + 2] = 32 + edge * 77;
        result.data[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(result, 0, 0);
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    return map;
  }, [texture]);
  useEffect(() => () => outline.dispose(), [outline]);
  return <group>
    <mesh position={[0, 0, .071]}>
      <planeGeometry args={[.78, .78]} />
      <meshBasicMaterial map={outline} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0, .072]}>
      <planeGeometry args={[.78, .78]} />
      <meshBasicMaterial ref={colorMaterial} map={texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>;
}

export default function PhotoFrame({ focused, reduced, keyboardFocused, onSelect, onHover }) {
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
      <Suspense fallback={null}><Photo revealed={focused} reduced={reduced} /></Suspense>
      <mesh position={[0, -.28, -.23]} rotation={[-.4, 0, 0]} castShadow>
        <boxGeometry args={[.45, .55, .06]} />
        <meshStandardMaterial color="#493626" roughness={.8} />
      </mesh>
    </group>
  </InteractiveObject>;
}
