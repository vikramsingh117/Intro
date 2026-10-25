import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, Group, MathUtils, Mesh, MeshStandardMaterial, Object3D, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const noRaycast=()=>{};
const LEDS=Array.from({length:56},(_,i)=>i*Math.PI*2/56);
export default function Upliance({ placement=DEFAULT_PROP_PLACEMENT.upliance, reduced=false, interactive=true, onHover=()=>{} }) {
  const {scene}=useLoader(GLTFLoader,'/models/upliance/interactive.glb');
  const display=useLoader(TextureLoader,'/images/upliance-display.svg');
  display.colorSpace=SRGBColorSpace;
  const {invalidate,gl}=useThree();
  const [hovered,setHovered]=useState(false),[latched,setLatched]=useState(false);
  const lastPointerType=useRef('mouse');
  const progress=useRef(0),screenMaterial=useRef(null),leds=useRef(null),spill=useRef(null),hitArea=useRef(null);
  const ledMaterial=useMemo(()=>new MeshStandardMaterial({color:'#b0d4ff',emissive:'#3878ff',emissiveIntensity:0,transparent:true,opacity:0,depthWrite:false}),[]);
  useEffect(()=>()=>ledMaterial.dispose(),[ledMaterial]);
  useLayoutEffect(()=>{const transform=new Object3D();LEDS.forEach((angle,i)=>{transform.position.set(Math.cos(angle)*9.95,0,Math.sin(angle)*9.95);transform.rotation.y=-angle;transform.updateMatrix();leds.current.setMatrixAt(i,transform.matrix);});leds.current.instanceMatrix.needsUpdate=true;invalidate();},[invalidate]);
  const active=interactive&&(hovered||latched);
  const {model,lidPivot,scale,offset,hitSize,hitCenter,glowMaterials}=useMemo(()=>{
    const model=scene.clone(true);
    const bounds=new Box3().setFromObject(model),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
    const lid=model.getObjectByName('JarLid');
    const lidPivot=new Group();lidPivot.name='LidPivot';lidPivot.position.set(0,21,-10.2);
    model.add(lidPivot);model.updateMatrixWorld(true);lidPivot.attach(lid);
    // The original CAD screen is replaced by a flush display at the measured panel plane.
    model.getObjectByName('ScreenPanel').visible=false;
    const glowMaterials=[];
    model.getObjectByName('LightGuides').traverse(node=>{
      if(!node.isMesh)return;
      const clone=source=>{const material=source.clone();material.emissive.set('#397eff');material.emissiveIntensity=0;glowMaterials.push(material);return material;};
      node.material=Array.isArray(node.material)?node.material.map(clone):clone(node.material);
    });
    model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;node.raycast=noRaycast;}});
    return {model,lidPivot,scale:2.7/Math.max(size.x,size.z),offset:new Vector3(-center.x,-bounds.min.y,-center.z),hitSize:size,hitCenter:center,glowMaterials};
  },[scene]);
  useEffect(()=>()=>glowMaterials.forEach(material=>material.dispose()),[glowMaterials]);
  useEffect(()=>{invalidate();},[active,reduced,invalidate]);
  useEffect(()=>{if(!interactive){setHovered(false);setLatched(false);}},[interactive]);
  useEffect(()=>{
    const reset=()=>{setHovered(false);setLatched(false);};
    window.addEventListener('blur',reset);
    return ()=>window.removeEventListener('blur',reset);
  },[]);
  useEffect(()=>{
    if(!hovered||!interactive)return;
    const id=hitArea.current.uuid;
    gl.domElement.dataset.cursorObject=id;
    gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change',{bubbles:true}));
    return ()=>{
      if(gl.domElement.dataset.cursorObject===id){delete gl.domElement.dataset.cursorObject;gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change',{bubbles:true}));}
    };
  },[hovered,interactive,gl]);
  useFrame((_,dt)=>{
    const target=active?1:0;
    let value=reduced?target:MathUtils.damp(progress.current,target,5,Math.min(dt,.05));
    if(Math.abs(value-target)<.001)value=target;
    progress.current=value;
    lidPivot.rotation.x=-Math.PI*.57*value;
    lidPivot.position.y=21+.7*value;
    glowMaterials.forEach(material=>{material.emissiveIntensity=3.5*value;});
    ledMaterial.opacity=value;ledMaterial.emissiveIntensity=5*value;
    if(screenMaterial.current)screenMaterial.current.opacity=value;
    if(spill.current)spill.current.intensity=1.2*value;
    if(value!==target)invalidate();
  });
  return <group position={[placement.x,placement.y,placement.z]} rotation={[0,placement.rotation*Math.PI/180,0]} scale={placement.scale}>
    <group scale={scale}><group position={offset}>
      <primitive object={model}/>
      {/* Fixed hit volume prevents the moving lid from repeatedly retriggering hover. */}
      <mesh ref={hitArea} position={hitCenter} raycast={interactive?Mesh.prototype.raycast:noRaycast}
        onPointerOver={event=>{event.stopPropagation();if(event.pointerType!=='touch'&&event.pointerType!=='pen'){setHovered(true);onHover('Upliance · cooking preview');}}}
        onPointerDown={event=>{lastPointerType.current=event.pointerType||'mouse';}}
        onPointerOut={()=>{setHovered(false);onHover('');}}
        onPointerCancel={()=>{setHovered(false);setLatched(false);onHover('');}}
        onClick={event=>{event.stopPropagation();if(event.delta<=5&&['touch','pen'].includes(lastPointerType.current)){setLatched(value=>!value);onHover('Upliance · tap to wake or sleep');}}}>
        <boxGeometry args={hitSize.toArray()}/><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false}/>
      </mesh>
      <group position={[18.65,12.65,10.71]} rotation={[-Math.atan2(.551928,.833892),0,0]}>
        <mesh raycast={noRaycast}><planeGeometry args={[17.28,10.68]}/><meshBasicMaterial color="#03070c" toneMapped={false}/></mesh>
        <mesh position={[0,0,.025]} raycast={noRaycast}><planeGeometry args={[17.15,10.58]}/><meshBasicMaterial ref={screenMaterial} map={display} transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
      </group>
      <group position={[0,5.65,0]}>
        {/* A shared material keeps the blue LED segments fading together. */}
        <instancedMesh ref={leds} args={[null,ledMaterial,LEDS.length]} raycast={noRaycast}>
          <boxGeometry args={[.22,.13,.48]}/>
        </instancedMesh>
      </group>
      <pointLight ref={spill} position={[0,7,0]} color="#397eff" intensity={0} distance={2.5} decay={2}/>
    </group></group>
  </group>;
}
