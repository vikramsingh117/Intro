// Projects actual swarm samples onto matching landmarks in the illustrated room.
// Standalone previews reuse the same 3D choreography; the light pulse follows the striker's clock.
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { choreography, liveFireflies, LOOP_SECONDS, SWARM } from './fireflyChoreography.mjs';
import { ceilingLightBridge } from './ceilingLightBridge';

const landmarks = [
  [-6.2,-.2,.2,67,142], [3.28,.36,.12,298,120],
  [6.08,.36,-.04,414,143], [1.52,-2.5,3.34,258,210],
  [6.22,3.72,-.45,414,35], [5.72,2.65,-.05,390,65],
  [-3.65,-.28,1.05,120,157],
];
export function projectFirefly(point) {
  const baseX=240+point.x*25, baseY=140-point.y*25+point.z*8;
  let weight=0, dx=0, dy=0;
  for(const [x,y,z,px,py] of landmarks){
    const distance=(point.x-x)**2+(point.y-y)**2+(point.z-z)**2;
    if(distance<1e-10)return [px,py];
    const w=1/(distance*distance);
    weight+=w;dx+=w*(px-(240+x*25));dy+=w*(py-(140-y*25+z*8));
  }
  return [baseX+dx/weight,baseY+dy/weight];
}
export default function usePixelFireflies(active) {
  const root=useRef(null);
  useEffect(()=>{
    if(!active)return;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const point=new Vector3(), tangent=new Vector3();
    let frame,elapsed=0,last;
    const update=now=>{
      const delta=last===undefined?0:Math.min((now-last)/1000,.05);last=now;
      if(!document.hidden){
        const {x,y}=ceilingLightBridge;
        root.current?.querySelectorAll('[data-pixel-fixture]').forEach(node=>node.setAttribute('transform',`translate(${x} ${y})`));
        root.current?.querySelector('[data-pixel-rope]')?.setAttribute('d',`M414 0 Q${414+x*.3} 12 ${414+x} ${23+y}`);
        const hotspot=root.current?.querySelector('[data-ceiling-hotspot]');
        if(hotspot)hotspot.style.transform=`translate(${x/51*100}%,${y/20*100}%)`;
        if(!media.matches)elapsed+=delta;
        let strikerTime=0;
        SWARM.forEach((config,index)=>{
          const live=media.matches?null:liveFireflies.get(config.seed);
          const time=media.matches?0:live?.time??elapsed;
          if(live)point.copy(live.point);else choreography(time,config,point,tangent);
          const [x,y]=projectFirefly(point);
          root.current?.querySelector(`[data-pixel-firefly="${index}"]`)?.setAttribute('transform',`translate(${x} ${y})`);
          if(config.striker)strikerTime=time;
        });
        const t=strikerTime%LOOP_SECONDS-19;
        const gain=t<.1?1:t<.42?.06:t<.65?.86:t<1.3?.025:t<1.65?.64+(t-1.3)/.35*.36:1;
        root.current?.querySelectorAll('[data-firefly-light]').forEach(node=>{node.style.opacity=String(gain);});
      }
      frame=requestAnimationFrame(update);
    };
    frame=requestAnimationFrame(update);
    return ()=>cancelAnimationFrame(frame);
  },[active]);
  return root;
}
