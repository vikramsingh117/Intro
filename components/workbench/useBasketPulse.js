// Converts a basket-score event into a short frame-driven lighting intensity envelope.
// CeilingLight and DeskLamp use it to synchronize their celebration response.
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { celebrationLight } from './basketball.mjs';

export default function useBasketPulse(score, reduced, apply) {
  const start = useRef(null);
  const { invalidate } = useThree();
  useEffect(() => { if (score) { start.current = performance.now(); invalidate(); } }, [score, invalidate]);
  useFrame(() => {
    if (start.current === null) return;
    const gain = celebrationLight((performance.now() - start.current) / 1000, reduced);
    apply(gain);
    if (gain === null) start.current = null;
    else invalidate();
  });
}
