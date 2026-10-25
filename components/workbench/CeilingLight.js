import { useEffect, useMemo, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { Box3, Object3D, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import InteractiveObject from './InteractiveObject';

const HANG_HEIGHT = 5.6;
const CEILING_HEIGHT = 24;
export default function CeilingLight({ onHover }) {
  const [on,setOn]=useState(true);
  const {scene}=useLoader(GLTFLoader,'/models/ceiling-light/optimized.gltf');
  const {invalidate}=useThree();
  const {model,bulb,lightPosition,materials,bulbMaterials}=useMemo(()=>{
    const model=scene.clone(true),materials=[],bulbMaterials=[];
    const bounds=new Box3().setFromObject(model),center=bounds.getCenter(new Vector3());
    const scale=4/bounds.getSize(new Vector3()).y;
    const bulbBounds=new Box3();
    model.traverse(node=>{
      if(!node.isMesh)return;
      const isBulb=node.name.includes('LightBulb');
      if(isBulb)bulbBounds.union(new Box3().setFromObject(node));
      // Avoid magnifying the shade into wall-sized silhouettes from nearby lights.
      node.castShadow=false;node.receiveShadow=!isBulb;
      const copy=source=>{
        const material=source.clone();materials.push(material);
        if(isBulb){
          material.emissive.set('#ffd29a');
          // A luminous frosted bulb remains visible instead of disappearing through transmission.
          material.transmission=.12;material.roughness=.3;
          bulbMaterials.push(material);
        }
        return material;
      };
      node.material=Array.isArray(node.material)?node.material.map(copy):copy(node.material);
    });
    const offset=new Vector3(-center.x,-bounds.max.y,-center.z);
    const bulb=bulbBounds.getCenter(new Vector3()).add(offset).multiplyScalar(scale);
    const lightPosition=bulb.clone();
    lightPosition.y=(bulbBounds.min.y+offset.y)*scale-.08;
    model.scale.multiplyScalar(scale);model.position.copy(offset.multiplyScalar(scale));
    return {model,bulb,lightPosition,materials,bulbMaterials};
  },[scene]);
  const lightTarget=useMemo(()=>{
    const target=new Object3D();
    target.position.set(lightPosition.x,lightPosition.y-8,lightPosition.z);
    return target;
  },[lightPosition]);
  useEffect(()=>{
    bulbMaterials.forEach(material=>{material.emissiveIntensity=on?3.5:0;});invalidate();
  },[on,bulbMaterials,invalidate]);
  useEffect(()=>()=>materials.forEach(material=>material.dispose()),[materials]);
  return <group position={[6.8,HANG_HEIGHT,-.45]}>
    {/* Extend the fixture's suspension up to the existing high ceiling. */}
    <mesh position={[0,(CEILING_HEIGHT-HANG_HEIGHT)/2,0]} castShadow receiveShadow>
      <cylinderGeometry args={[.035,.035,CEILING_HEIGHT-HANG_HEIGHT+.08,12]}/><meshStandardMaterial color="#34332e" roughness={.8}/>
    </mesh>
    <mesh position={[0,CEILING_HEIGHT-HANG_HEIGHT-.04,0]} castShadow receiveShadow>
      <cylinderGeometry args={[.18,.18,.08,24]}/><meshStandardMaterial color="#34332e" metalness={.35} roughness={.6}/>
    </mesh>
    <InteractiveObject label={on?'Ceiling light · turn off':'Ceiling light · turn on'} onHover={onHover}>
      <group onClick={event=>{event.stopPropagation();if(event.delta<=5){setOn(value=>!value);onHover(on?'Ceiling light · turn on':'Ceiling light · turn off');}}}>
        <primitive object={model}/>
      </group>
    </InteractiveObject>
    <primitive object={lightTarget}/>
    <spotLight position={lightPosition} target={lightTarget} color="#ffd09a" intensity={on?65:0} distance={14} decay={2}
      angle={Math.PI/3} penumbra={1} castShadow shadow-mapSize={[1024,1024]}
      shadow-camera-near={.1} shadow-camera-far={14} shadow-normalBias={.025} shadow-bias={-.0001}/>
    <pointLight position={bulb} color="#ffd09a" intensity={on?3:0} distance={5} decay={2}/>
  </group>;
}
