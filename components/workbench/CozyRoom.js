// Builds the room shell, desk, drawers, window, and glasses around the separately loaded interactive props.
// WorkbenchScene supplies selection and lens state while this component owns shared procedural materials.
import GlassesDrawer from './GlassesDrawer';
import DeskGlasses from './DeskGlasses';
import InteractiveObject from './InteractiveObject';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';

function Block({ position, size, color, map, roughness = .85 }) {
  return <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} map={map} roughness={roughness} />
  </mesh>;
}

const RAIN_DROPS=Array.from({length:22},(_,index)=>({
  x:-1.55+(index*1.13)%3.1,
  y:-1.9+(index*.83)%3.8,
  speed:.75+(index%5)*.13,
  length:.14+(index%4)*.035,
}));
const WINDOW_RAIN_SPEED=1.3;
const GLASS_DROPLETS=[
  {x:-1.28,y:1.62,r:.036,stretch:1.18,opacity:.48},
  {x:-.88,y:.74,r:.022,stretch:1.42,opacity:.42},
  {x:-.42,y:1.35,r:.028,stretch:1.12,opacity:.5},
  {x:.06,y:.28,r:.019,stretch:1.55,opacity:.38},
  {x:.44,y:1.7,r:.032,stretch:1.24,opacity:.46},
  {x:.82,y:.92,r:.024,stretch:1.38,opacity:.42},
  {x:1.26,y:1.42,r:.018,stretch:1.2,opacity:.4},
  {x:-1.08,y:-.18,r:.026,stretch:1.32,opacity:.44},
  {x:.68,y:-.62,r:.034,stretch:1.18,opacity:.46},
];

function RainWindow({ reduced }) {
  const drops=useRef([]);
  const invalidate=useThree(state=>state.invalidate);
  useEffect(()=>{invalidate();},[invalidate]);
  useFrame((state,delta)=>{
    if(reduced)return;
    drops.current.forEach((drop,index)=>{
      if(!drop)return;
      drop.position.y-=Math.min(delta,.05)*RAIN_DROPS[index].speed*WINDOW_RAIN_SPEED;
      if(drop.position.y < -2.12)drop.position.y=2.12;
    });
    state.invalidate();
  });
  return <group>
    {RAIN_DROPS.map((drop,index)=><mesh key={index} ref={node=>{drops.current[index]=node;}} position={[drop.x,drop.y,.055]} rotation={[0,0,-.15]}>
      <boxGeometry args={[.018,drop.length,.012]}/><meshBasicMaterial color="#a8c5c6" transparent opacity={.72}/>
    </mesh>)}
    {GLASS_DROPLETS.map((drop,index)=><group key={`glass-${index}`} position={[drop.x,drop.y,.062]} scale={[1,drop.stretch,1]}>
      <mesh raycast={()=>null}><circleGeometry args={[drop.r,14]}/><meshBasicMaterial color="#9fb9bd" transparent opacity={drop.opacity} depthWrite={false} toneMapped={false}/></mesh>
      <mesh position={[-drop.r*.24,drop.r*.28,.002]} raycast={()=>null}><circleGeometry args={[drop.r*.27,10]}/><meshBasicMaterial color="#eef8f5" transparent opacity={.58} depthWrite={false} toneMapped={false}/></mesh>
    </group>)}
  </group>;
}

function WindowWeather({ year, reduced }) {
  const day=year==='2021',rain=year==='2025';
  if(year==='2026')return null;
  return <group position={[-4.6,1.6,-3.36]}>
    <mesh><planeGeometry args={[3.34,4.34]}/><meshBasicMaterial color={day?'#e5c58f':'#49666b'} transparent opacity={day ? .1 : .24} depthWrite={false}/></mesh>
    {rain&&<RainWindow reduced={reduced}/>}
  </group>;
}

export default function CozyRoom({ roomYear='2026', keyboardTarget, registerRoomAction, onWindowSelect, onHover, reduced, wearingGlasses, glassesPlacement, glassesLens, onWearGlasses }) {
  const wood = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#a98360'; ctx.fillRect(0, 0, 1024, 256);
    // Deterministic fine grain, running along the length of the desktop.
    for (let i = 0; i < 210; i++) {
      const y = i * 1.25;
      ctx.strokeStyle = i % 3 === 0 ? '#51351d20' : '#e8cba21a';
      ctx.lineWidth = i % 7 === 0 ? 1.6 : .6;
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 8) {
        const offset = Math.sin(x * .008 + i * .7) * 2 + Math.sin(x * .021 + i) * .7;
        if (!x) ctx.moveTo(x, y + offset); else ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);
  useEffect(() => () => wood.dispose(), [wood]);
  const wall = '#777c70';
  const trim = '#414c46';
  const windowLabel=roomYear==='2021'?'Window · daylight':roomYear==='2025'?'Window · rainy city':'Window · city after dark';
  return <group>
    {/* Extra room to the left of the window for future props; floor and trim meet the moved corner. */}
    <Block position={[7.35, -4.9, 24.8]} size={[33.5, .2, 56]} color="#52483c" />
    <Block position={[7.35, -2.7, -3.2]} size={[33.3, 4.2, .2]} color={wall} />
    <Block position={[7.35, 13.9, -3.2]} size={[33.3, 20.2, .2]} color={wall} />
    <Block position={[-7.8, 1.6, -3.2]} size={[3, 4.4, .2]} color={wall} />
    <Block position={[10.55, 1.6, -3.2]} size={[26.9, 4.4, .2]} color={wall} />
    <Block position={[-9.3, 9.6, 21.8]} size={[.2, 28.8, 50]} color="#6b7367" />
    <Block position={[24, 9.6, 24.8]} size={[.2, 28.8, 56]} color={wall} />
    <Block position={[7.35, 24.1, 24.8]} size={[33.5, .2, 56]} color="#929488" />
    <Block position={[7.35, -4.64, -3.04]} size={[33.3, .32, .12]} color={trim} />
    {[-9.14, 23.84].map(x => <Block key={x} position={[x, -4.64, x < 0 ? 21.8 : 24.8]} size={[.12, .32, x < 0 ? 50 : 56]} color={trim} />)}
    <InteractiveObject focused={keyboardTarget==='window'} label={windowLabel} onHover={onHover} onFocus={onWindowSelect}><group onClick={event => { event.stopPropagation(); if (event.delta <= 5) onWindowSelect(); }}>
    {/* Click the window to explore the city. */}
    <WindowWeather year={roomYear} reduced={reduced}/>
    <mesh position={[-4.6, 1.6, -3.33]}>
      <planeGeometry args={[3.4, 4.4]} />
      <meshStandardMaterial color="#102532" emissive="#24495d" emissiveIntensity={.1} transparent opacity={.06} depthWrite={false} roughness={.2} metalness={.1} />
    </mesh>
    {[-6.3, -2.9].map(x => <Block key={x} position={[x, 1.6, -3.05]} size={[.17, 4.65, .34]} color="#b5b5a1" />)}
    {[-.6, 3.8].map(y => <Block key={y} position={[-4.6, y, -3.05]} size={[3.55, .18, .34]} color="#b5b5a1" />)}
    <Block position={[-4.6, 1.6, -3.01]} size={[.09, 4.3, .2]} color="#a2a996" />
    <Block position={[-4.6, 1.5, -2.99]} size={[3.3, .09, .22]} color="#a2a996" />
    <Block position={[-4.6, -.75, -2.87]} size={[3.85, .16, .75]} color="#bca98a" roughness={.6} />
    <Block position={[-4.46, .85, -2.84]} size={[.07, .34, .08]} color="#788378" roughness={.4} />
    </group></InteractiveObject>
    {/* Full desktop, apron, inset legs and a lower stretcher. Monitor rests at y=-1.5. */}
    <Block position={[0, -1.64, -.05]} size={[10, .28, 4.3]} color="#e3c29c" map={wood} roughness={.6} />
    <Block position={[0, -1.91, -1.76]} size={[9.4, .34, .12]} color="#75563b" map={wood} />
    {[-4.35, 4.35].map(x => <group key={x}>
      <Block position={[x, -3.32, -.05]} size={[.28, 2.95, 3.65]} color="#343c37" roughness={.6} />
      <Block position={[x, -4.8, -.05]} size={[.5, .08, 3.8]} color="#252d29" />
    </group>)}
    {/* Three inset drawers; leave the center clear for a chair. */}
    {/* Cabinet shell leaves the top drawer cavity open. */}
    {[-4.12,-2.18].map(x => <Block key={x} position={[x,-3.12,-.12]} size={[.11,2.6,3.45]} color="#6e5039" map={wood}/>)}
    <Block position={[-3.15,-3.52,-.12]} size={[1.85,1.8,3.45]} color="#6e5039" map={wood}/>
    <Block position={[-3.15,-2.22,-1.8]} size={[1.85,.8,.1]} color="#6e5039" map={wood}/>
    <GlassesDrawer keyboardFocused={keyboardTarget==='drawer'} registerRoomAction={registerRoomAction} wood={wood} reduced={reduced} onHover={onHover}/>
    {roomYear==='2026' && <DeskGlasses placement={glassesPlacement} keyboardTarget={keyboardTarget} registerRoomAction={registerRoomAction} onHover={onHover} wearingLens={wearingGlasses?glassesLens:null} onWear={onWearGlasses}/>}
    {[-3.08,-3.89].map(y => <group key={y}>
      <Block position={[-3.15,y,1.66]} size={[1.9,.73,.12]} color="#ba9168" map={wood} roughness={.65}/>
      <Block position={[-3.15,y+.05,1.78]} size={[.65,.065,.09]} color="#33413a" roughness={.4}/>
    </group>)}
    <Block position={[0, -3.7, -1.7]} size={[8.5, .16, .18]} color="#343c37" />
  </group>;
}
