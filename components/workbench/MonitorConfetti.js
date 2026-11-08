import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three';
import { CELEBRATION_MS } from './basketball.mjs';

const COLORS = ['#ffc66d', '#f47f87', '#9ddeaa', '#8ab9ff', '#e8ddba'];
export default function MonitorConfetti({ score, reduced }) {
  const { invalidate } = useThree();
  const started = useRef(null), mesh = useRef(null);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 232;
    const result = new CanvasTexture(canvas); result.colorSpace = SRGBColorSpace;
    result.magFilter = NearestFilter; result.minFilter = NearestFilter; result.generateMipmaps = false;
    return result;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => { if (score) { started.current = performance.now(); invalidate(); } }, [score, invalidate]);
  useFrame(() => {
    if (started.current === null) return;
    const elapsed = (performance.now() - started.current) / CELEBRATION_MS;
    mesh.current.visible = elapsed < 1;
    if (elapsed >= 1) { started.current = null; return; }
    const ctx = texture.image.getContext('2d'); ctx.clearRect(0, 0, 384, 232);
    ctx.globalAlpha = Math.min(1, (1 - elapsed) * 5);
    for (let i = 0; i < 64; i++) {
      const seed = i * 2.39996 + score;
      const x = reduced ? (i * 79 % 380) : 192 + Math.sin(seed) * (40 + elapsed * 230);
      const y = reduced ? (i * 37 % 228) : 112 - Math.abs(Math.cos(seed)) * elapsed * 210 + elapsed * elapsed * 260;
      ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fillRect(Math.round(x), Math.round(y), i % 3 + 3, i % 2 + 3);
    }
    texture.needsUpdate = true; invalidate();
  });
  return <mesh ref={mesh} visible={false} position={[0, 0, .0004]} raycast={()=>null}>
    <planeGeometry args={[.376, .232]}/><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false}/>
  </mesh>;
}
