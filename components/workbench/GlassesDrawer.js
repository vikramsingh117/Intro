import useTrackedState from './useTrackedState';
import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import InteractiveObject from './InteractiveObject';

function Wood({ position, size, map, color = '#aa805b' }) {
  useTrackedState({drawer:open});
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} map={map} roughness={.8}/></mesh>;
}
export default function GlassesDrawer({ wood, reduced, onHover, wearing, onWear }) {
  const [open, setOpen] = useState(false);
  const tray = useRef(null);
  const slide = useRef(null);
  const { invalidate } = useThree();
  useEffect(() => {
    slide.current = { from: tray.current?.position.z || 0, to: open ? 1.65 : 0, elapsed: 0 };
    invalidate();
  }, [open, reduced, invalidate]);
  useFrame((state, delta) => {
    if (!tray.current || !slide.current) return;
    const motion = slide.current;
    motion.elapsed += Math.min(delta, .05);
    const progress = reduced ? 1 : Math.min(1, motion.elapsed / .85);
    const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
    tray.current.position.z = motion.from + (motion.to - motion.from) * eased;
    if (progress < 1) state.invalidate();
    else slide.current = null;
  });
  return <group position={[-3.15,-2.27,0]}>
    <group ref={tray}>
      <Wood position={[0,-.32,.1]} size={[1.78,.1,3]} map={wood} color="#5a4435"/>
      {[-.86,.86].map(x => <Wood key={x} position={[x,-.12,.1]} size={[.09,.42,3]} map={wood}/>)}
      <Wood position={[0,-.12,-1.35]} size={[1.78,.42,.09]} map={wood}/>
      <InteractiveObject label={open ? 'Top drawer · close' : 'Top drawer · open'} onHover={onHover}>
        <group onClick={event => { event.stopPropagation(); if(event.delta<=5){setOpen(value=>!value);onHover('');} }}>
          <Wood position={[0,0,1.66]} size={[1.9,.73,.12]} map={wood} color="#ba9168"/>
          <mesh position={[0,.05,1.78]}><boxGeometry args={[.65,.065,.09]}/><meshStandardMaterial color="#33413a" roughness={.4}/></mesh>
        </group>
      </InteractiveObject>
      {!wearing && <InteractiveObject label="Glasses · try them on" onHover={onHover}>
        <group position={[0,-.23,1]} onClick={event=>{event.stopPropagation();if(open && !slide.current && event.delta<=5){onHover('');onWear();}}}>
          {[-.28,.28].map(x=><group key={x} position={[x,0,0]}>
            <mesh rotation={[-Math.PI/2,0,0]} castShadow><torusGeometry args={[.22,.025,8,32]}/><meshStandardMaterial color="#c9aa71" metalness={.65} roughness={.3}/></mesh>
            <mesh rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.2,32]}/><meshStandardMaterial color="#a9d1d1" transparent opacity={.25} roughness={.1} metalness={.15}/></mesh>
          </group>)}
          <mesh position={[0,0,0]}><boxGeometry args={[.15,.035,.035]}/><meshStandardMaterial color="#c9aa71" metalness={.65} roughness={.3}/></mesh>
          {[-.5,.5].map(x=><mesh key={x} position={[x,.025,-.23]} castShadow><boxGeometry args={[.03,.035,.46]}/><meshStandardMaterial color="#b99b68" metalness={.6} roughness={.3}/></mesh>)}
          {/* A forgiving touch target around the thin frames. */}
          <mesh><boxGeometry args={[1.1,.14,.65]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
        </group>
      </InteractiveObject>}
    </group>
  </group>;
}
