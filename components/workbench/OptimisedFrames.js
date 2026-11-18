// Drives the entire R3F simulation and renderer at 30 FPS when optimisation is enabled.
// Manual advancement prevents animated props from bypassing the cap through invalidate calls.
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
export default function OptimisedFrames({ enabled }) {
  const { advance, clock, invalidate } = useThree();
  useEffect(()=>{
    if(!enabled){invalidate();return;}
    let last=performance.now();
    const timer=setInterval(()=>{
      const now=performance.now(),delta=Math.min((now-last)/1000,.05);last=now;
      if(!document.hidden)advance(clock.elapsedTime+delta);
    },1000/30);
    return ()=>clearInterval(timer);
  },[enabled,advance,clock,invalidate]);
  return null;
}
