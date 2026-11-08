import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { createStationaryShadowCache } from './shadowCache.mjs';

export default function StationaryShadows() {
  const cache = useMemo(() => createStationaryShadowCache({ motionInterval: 1 / 30 }), []);
  useEffect(() => () => cache.dispose(), [cache]);
  // Animations run at priority 0; NightEffects renders at priority 1.
  // Refresh dirty shadow maps using this frame's final object transforms.
  useFrame(({ scene, invalidate }, delta) => {
    if (cache.update(scene, delta)) invalidate();
  }, .5);
  return null;
}
