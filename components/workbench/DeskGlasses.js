import { useEffect, useMemo } from 'react';
import { CatmullRomCurve3, Path, Shape, Vector3 } from 'three';
import InteractiveObject from './InteractiveObject';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';

function roundedLensShape(inset=0) {
  const width=.27-inset, height=.18-inset*.65;
  const shape=new Shape();
  shape.moveTo(-width,-height*.55);
  shape.bezierCurveTo(-width,-height,width*.5,-height,width*.82,-height*.72);
  shape.bezierCurveTo(width,-height*.45,width,height*.48,width*.72,height*.75);
  shape.bezierCurveTo(width*.35,height,-width*.52,height,-width*.82,height*.62);
  shape.bezierCurveTo(-width,height*.35,-width,-height*.25,-width,-height*.55);
  return shape;
}

function angularLensShape(inset=0) {
  const width=.27-inset,height=.18-inset*.65;
  const shape=new Shape();
  shape.moveTo(-width*.78,-height);shape.lineTo(width*.7,-height);shape.lineTo(width,-height*.35);
  shape.lineTo(width*.84,height*.72);shape.lineTo(width*.35,height);shape.lineTo(-width*.72,height*.82);
  shape.lineTo(-width,height*.25);shape.closePath();return shape;
}

function LensAssembly({ x, frame, lens, frameColor, lensColor='#b9d8d5' }) {
  return <group position={[x,.025,0]} rotation={[-Math.PI/2,0,0]}>
    <mesh castShadow><extrudeGeometry args={[frame,{depth:.018,bevelEnabled:true,bevelThickness:.007,bevelSize:.006,bevelSegments:2,curveSegments:24}]}/><meshStandardMaterial color={frameColor} metalness={.58} roughness={.3}/></mesh>
    <mesh position={[0,0,.012]}><shapeGeometry args={[lens,24]}/><meshPhysicalMaterial color={lensColor} transparent opacity={.22} transmission={.62} thickness={.012} roughness={.08} metalness={.05} depthWrite={false}/></mesh>
  </group>;
}

function Temples({ geometry, color }) {
  return <>{[geometry.leftTemple,geometry.rightTemple].map((curve,index)=><mesh key={index} castShadow><tubeGeometry args={[curve,28,.014,7,false]}/><meshStandardMaterial color={color} metalness={.68} roughness={.3}/></mesh>)}</>;
}

function VintageFrames({ geometry }) {
  return <>
    {[-.25,.25].map(x=><group key={x} position={[x,.025,0]}>
      <mesh rotation={[-Math.PI/2,0,0]} castShadow><torusGeometry args={[.205,.017,10,40]}/><meshStandardMaterial color="#9c7b48" metalness={.9} roughness={.18}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.198,40]}/><meshPhysicalMaterial color="#c5d8d1" transparent opacity={.18} transmission={.72} thickness={.012} roughness={.06} depthWrite={false}/></mesh>
    </group>)}
    <mesh castShadow><tubeGeometry args={[geometry.bridge,18,.014,8,false]}/><meshStandardMaterial color="#9c7b48" metalness={.9} roughness={.18}/></mesh>
    <Temples geometry={geometry} color="#80633d"/>
    {[-.085,.085].map(x=><mesh key={x} position={[x,.018,-.05]} rotation={[-.18,0,x<0?-.3:.3]}><sphereGeometry args={[.028,12,8]}/><meshPhysicalMaterial color="#e1e2d8" transparent opacity={.58} roughness={.3}/></mesh>)}
  </>;
}

function PixelFrames() {
  const bars=[[-.23,0,.02,.38],[.23,0,.02,.38],[0,-.18,.48,.025],[0,.18,.48,.025]];
  return <>
    {[-.285,.285].map(center=><group key={center} position={[center,.04,0]}>{bars.map(([x,z,w,d],index)=><mesh key={index} position={[x,0,z]} castShadow><boxGeometry args={[w,.045,d]}/><meshStandardMaterial color={index%2?'#536d66':'#2f4946'} roughness={.36} metalness={.25}/></mesh>)}<mesh><boxGeometry args={[.42,.012,.31]}/><meshPhysicalMaterial color="#9bc8c4" transparent opacity={.18} transmission={.5} roughness={.16} depthWrite={false}/></mesh></group>)}
    <mesh position={[0,.04,0]} castShadow><boxGeometry args={[.11,.045,.035]}/><meshStandardMaterial color="#314b47" roughness={.35}/></mesh>
    {[-1,1].map(side=><group key={side}><mesh position={[side*.51,.055,-.15]} rotation={[0,side*.52,0]} castShadow><boxGeometry args={[.025,.035,.36]}/><meshStandardMaterial color="#263d3b" roughness={.4}/></mesh><mesh position={[side*.36,.06,-.32]} rotation={[0,side*1.22,0]} castShadow><boxGeometry args={[.025,.035,.36]}/><meshStandardMaterial color="#263d3b" roughness={.4}/></mesh></group>)}
  </>;
}

function CrayonFrames({ geometry }) {
  return <>
    <LensAssembly x={-.285} frame={geometry.frame} lens={geometry.lens} frameColor="#ef9b9a" lensColor="#ffd5c5"/>
    <LensAssembly x={.285} frame={geometry.frame} lens={geometry.lens} frameColor="#8ec9c1" lensColor="#c8eee5"/>
    <mesh castShadow><tubeGeometry args={[geometry.bridge,18,.022,7,false]}/><meshStandardMaterial color="#eccb78" roughness={.72}/></mesh>
    <Temples geometry={geometry} color="#b7a0d5"/>
  </>;
}

function SketchFrames({ geometry }) {
  return <>
    <LensAssembly x={-.285} frame={geometry.angularFrame} lens={geometry.angularLens} frameColor="#eeeeea" lensColor="#d9dcda"/>
    <LensAssembly x={.285} frame={geometry.angularFrame} lens={geometry.angularLens} frameColor="#777d7b" lensColor="#e5e6e4"/>
    <mesh castShadow><tubeGeometry args={[geometry.bridge,12,.015,5,false]}/><meshStandardMaterial color="#aeb2af" metalness={.25} roughness={.58}/></mesh>
    <Temples geometry={geometry} color="#676d6b"/>
  </>;
}

const DESK_LENSES = [
  {id:'blur',label:'Round glasses · wear blur lens'},
  {id:'pixel',label:'Pixel glasses · wear pixel lens'},
  {id:'crayon',label:'Pastel glasses · wear crayon lens'},
  {id:'sketch',label:'Monochrome glasses · wear sketch lens'},
];

export default function DeskGlasses({ placement=DEFAULT_PROP_PLACEMENT.glasses, keyboardTarget, registerRoomAction, onHover, wearingLens, onWear }) {
  useEffect(()=>{
    const cleanups=DESK_LENSES.map(({id})=>registerRoomAction?.(`glasses-${id}`,()=>{if(!wearingLens){onHover('');onWear(id);}}));
    return ()=>cleanups.forEach(cleanup=>cleanup?.());
  },[registerRoomAction,onHover,onWear,wearingLens]);
  const geometry=useMemo(()=>{
    const frame=roundedLensShape();
    const hole=roundedLensShape(.035);
    frame.holes.push(new Path(hole.getPoints(28)));
    const angularFrame=angularLensShape();
    angularFrame.holes.push(new Path(angularLensShape(.038).getPoints(12)));
    return {
      frame,
      lens:roundedLensShape(.038),
      angularFrame,
      angularLens:angularLensShape(.042),
      bridge:new CatmullRomCurve3([new Vector3(-.075,.045,.015),new Vector3(0,.09,-.015),new Vector3(.075,.045,.015)]),
      leftTemple:new CatmullRomCurve3([new Vector3(-.53,.045,-.01),new Vector3(-.5,.055,-.18),new Vector3(-.18,.06,-.34),new Vector3(.22,.055,-.31)]),
      rightTemple:new CatmullRomCurve3([new Vector3(.53,.045,-.01),new Vector3(.5,.055,-.18),new Vector3(.18,.06,-.34),new Vector3(-.22,.055,-.31)]),
    };
  },[]);
  return <group>{DESK_LENSES.map(({id,label},index)=>{
    if(wearingLens===id)return null;
    const model=<group position={[placement.x,placement.y,placement.z-index*.45]} rotation={[0,placement.rotation*Math.PI/180,0]} scale={placement.scale}
      onClick={event=>{if(wearingLens)return;event.stopPropagation();if(event.delta<=5){onHover('');onWear(id);}}}>
      {id === 'pixel' ? <PixelFrames/> : id === 'crayon' ? <CrayonFrames geometry={geometry}/> : id === 'sketch' ? <SketchFrames geometry={geometry}/> : <VintageFrames geometry={geometry}/>}
      {[-.54,.54].map(x=><mesh key={x} position={[x,.045,-.015]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.018,.018,.065,10]}/><meshStandardMaterial color={id==='crayon'?'#b7a0d5':id==='sketch'?'#777d7b':'#765c38'} metalness={.62} roughness={.3}/></mesh>)}
      <mesh position={[0,.08,-.08]}><boxGeometry args={[1.18,.2,.78]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
    </group>;
    return wearingLens?<group key={id}>{model}</group>:<InteractiveObject key={id} focused={keyboardTarget===`glasses-${id}`} label={label} onHover={onHover}>{model}</InteractiveObject>;
  })}</group>;
}
