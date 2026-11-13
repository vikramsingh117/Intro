import useBasketPulse from './useBasketPulse';
import useTrackedState from './useTrackedState';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, Object3D, Plane, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import InteractiveObject from './InteractiveObject';
import useSwitchSound from './useSwitchSound';
import { createLightRope, stepLightRope, kickLightRope } from './lightRope.mjs';

const CEILING_HEIGHT = 24;
// Keep the shade in the room framing while retaining the ceiling connection.
const HANG_HEIGHT = 7.2;
const NECK_OFFSET=2.96;
const ROPE_LENGTH=CEILING_HEIGHT-HANG_HEIGHT+NECK_OFFSET;
export default function CeilingLight({ basketScore, fireflyHit, keyboardFocused, registerRoomAction, onHover, reduced, interactive=true, onDragging, onPowerChange }) {
  const [on,setOn]=useState(true);
  useEffect(()=>{onPowerChange?.(on);},[on,onPowerChange]);
  const playSwitch=useSwitchSound();
  const {scene}=useLoader(GLTFLoader,'/models/ceiling-light/optimized.gltf');
  const {invalidate,camera}=useThree();
  const fixture=useRef(null),wire=useRef(null),gesture=useRef(null),suppressClick=useRef(false);
  const rope=useRef(null);
  const fireflyFlicker=useRef(null);
  const spot=useRef(null), fill=useRef(null);
  const segment=useMemo(()=>new Object3D(),[]);
  const direction=useMemo(()=>new Vector3(),[]);
  const up=useMemo(()=>new Vector3(0,1,0),[]);
  const hit=useMemo(()=>new Vector3(),[]);
  useEffect(()=>{
    rope.current=createLightRope(ROPE_LENGTH,!reduced);
    if(reduced){rope.current.points.forEach((p,i)=>p.set(0,-ROPE_LENGTH*i/32,0));rope.current.previous.forEach((p,i)=>p.copy(rope.current.points[i]));rope.current.asleep=true;}
    invalidate();
  },[reduced,invalidate]);
  useEffect(()=>{
    if (!basketScore || reduced || gesture.current) return;
    kickLightRope(rope.current); invalidate();
  },[basketScore,reduced,invalidate]);
  useEffect(()=>{
    if(!fireflyHit)return;
    fireflyFlicker.current=performance.now();
    if(!reduced&&!gesture.current)kickLightRope(rope.current);
    invalidate();
  },[fireflyHit,reduced,invalidate]);
  const release=useCallback(()=>{
    const drag=gesture.current;if(!drag)return;
    gesture.current=null;suppressClick.current=drag.moved;
    if(drag.target.hasPointerCapture(drag.id))drag.target.releasePointerCapture(drag.id);
    onDragging?.(false);invalidate();
  },[onDragging,invalidate]);
  useEffect(()=>{
    window.addEventListener('blur',release);
    return ()=>{window.removeEventListener('blur',release);release();};
  },[release]);
  useEffect(()=>{if(!interactive)release();},[interactive,release]);
  useFrame((_,delta)=>{
    if(!fixture.current||!wire.current||!rope.current)return;
    const state=rope.current;
    stepLightRope(state,delta,gesture.current?.moved?gesture.current.destination:null);
    const points=state.points,end=points[32];
    fixture.current.position.copy(end);
    direction.subVectors(end,points[31]);
    const blend=1-Math.exp(-8*Math.min(delta,.05));
    const tiltX=state.asleep?0:Math.max(-.3,Math.min(.3,-direction.z));
    const tiltZ=state.asleep?0:Math.max(-.3,Math.min(.3,direction.x));
    fixture.current.rotation.x+=(tiltX-fixture.current.rotation.x)*blend;
    fixture.current.rotation.z+=(tiltZ-fixture.current.rotation.z)*blend;
    for(let i=0;i<32;i++){
      direction.subVectors(points[i+1],points[i]);
      segment.position.copy(points[i]).add(points[i+1]).multiplyScalar(.5);
      segment.scale.set(1,direction.length(),1);
      segment.quaternion.setFromUnitVectors(up,direction.normalize());segment.updateMatrix();
      wire.current.setMatrixAt(i,segment.matrix);
    }
    wire.current.instanceMatrix.needsUpdate=true;
    if(!state.asleep||gesture.current||Math.abs(fixture.current.rotation.x)+Math.abs(fixture.current.rotation.z)>.0001)invalidate();
  });
  const startDrag=event=>{
    if(!interactive||event.button!==0||gesture.current)return;
    event.stopPropagation();event.nativeEvent.stopImmediatePropagation();
    const normal=camera.getWorldDirection(new Vector3());
    const origin=rope.current.points[32].clone();
    gesture.current={id:event.pointerId,target:event.target,plane:new Plane().setFromNormalAndCoplanarPoint(normal,event.point),start:event.point.clone(),origin,destination:origin.clone(),screenX:event.clientX,screenY:event.clientY,moved:false};
    suppressClick.current=false;event.target.setPointerCapture(event.pointerId);onDragging?.(true);
  };
  const moveDrag=event=>{
    const drag=gesture.current;if(!drag||drag.id!==event.pointerId)return;
    event.stopPropagation();
    if(Math.hypot(event.clientX-drag.screenX,event.clientY-drag.screenY)>5)drag.moved=true;
    if(!drag.moved||!event.ray.intersectPlane(drag.plane,hit))return;
    // World-space pointer delta maps directly to translation, including lifting up.
    drag.destination.copy(hit).sub(drag.start).add(drag.origin);
    drag.destination.x=Math.max(-4,Math.min(4,drag.destination.x));
    drag.destination.z=Math.max(-3,Math.min(3,drag.destination.z));
    drag.destination.y=Math.max(-ROPE_LENGTH,Math.min(-ROPE_LENGTH+6,drag.destination.y));
    if(drag.destination.length()>ROPE_LENGTH)drag.destination.setLength(ROPE_LENGTH);
    rope.current.asleep=false;rope.current.quiet=0;invalidate();
  };
  const {model,bulb,lightPosition,materials,bulbMaterials,geometries}=useMemo(()=>{
    const model=scene.clone(true),materials=[],bulbMaterials=[],geometries=[];
    const bounds=new Box3().setFromObject(model),center=bounds.getCenter(new Vector3());
    const scale=4/bounds.getSize(new Vector3()).y;
    const bulbBounds=new Box3();
    model.traverse(node=>{
      if(!node.isMesh)return;
      const isBulb=node.name.includes('LightBulb');
      if(isBulb)bulbBounds.union(new Box3().setFromObject(node));
      if(!isBulb){
        // Replace the asset's baked-in straight cable with the simulated wire.
        const geometry=node.geometry.clone(),positions=geometry.attributes.position;
        const cutoff=bounds.max.y-NECK_OFFSET/scale,vertex=new Vector3();
        const indices=[],index=geometry.index,count=index?index.count:positions.count;
        for(let i=0;i<count;i+=3){
          const triangle=[0,1,2].map(j=>index?index.getX(i+j):i+j);
          if(triangle.every(j=>vertex.fromBufferAttribute(positions,j).applyMatrix4(node.matrixWorld).y<=cutoff+.00001))indices.push(...triangle);
        }
        geometry.setIndex(indices);
        const trimmed=geometry.toNonIndexed();geometry.dispose();
        trimmed.computeBoundingBox();trimmed.computeBoundingSphere();
        node.geometry=trimmed;geometries.push(trimmed);
      }
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
    return {model,bulb,lightPosition,materials,bulbMaterials,geometries};
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
  useEffect(()=>()=>geometries.forEach(geometry=>geometry.dispose()),[geometries]);
  useBasketPulse(basketScore, reduced, gain => {
    const intensity = gain === null ? (on ? 1 : 0) : gain;
    if (spot.current) spot.current.intensity = 65 * intensity;
    if (fill.current) fill.current.intensity = 3 * intensity;
    bulbMaterials.forEach(material=>{material.emissiveIntensity=3.5*intensity;});
  });
  useFrame(()=>{
    if(fireflyFlicker.current===null)return;
    const elapsed=(performance.now()-fireflyFlicker.current)/1000;
    let gain;
    if(elapsed<.1)gain=1;
    else if(elapsed<.42)gain=.06;
    else if(elapsed<.65)gain=.86;
    else if(elapsed<1.3)gain=.025;
    else if(elapsed<1.65)gain=.64+(elapsed-1.3)/.35*.36;
    else{fireflyFlicker.current=null;gain=1;}
    const intensity=on?gain:0;
    if(spot.current)spot.current.intensity=65*intensity;
    if(fill.current)fill.current.intensity=3*intensity;
    bulbMaterials.forEach(material=>{material.emissiveIntensity=3.5*intensity;});
    if(fireflyFlicker.current!==null)invalidate();
  });
  const toggle=useCallback(()=>{playSwitch(!on);setOn(value=>!value);onHover(on?'Ceiling light · turn on':'Ceiling light · turn off');},[on,onHover,playSwitch]);
  useEffect(()=>registerRoomAction?.('ceiling-light',toggle),[registerRoomAction,toggle]);
  useTrackedState({ceilingLight:on});
  return <group position={[6.8,CEILING_HEIGHT,-.45]}>
    <mesh position={[0,-.04,0]} castShadow receiveShadow>
      <cylinderGeometry args={[.18,.18,.08,24]}/><meshStandardMaterial color="#34332e" metalness={.35} roughness={.6}/>
    </mesh>
    <instancedMesh ref={wire} args={[null,null,32]} frustumCulled={false} raycast={()=>null}>
      <cylinderGeometry args={[.025,.025,1,8]}/><meshStandardMaterial color="#34332e" roughness={.8}/>
    </instancedMesh>
    <group ref={fixture} position={[0,-ROPE_LENGTH,0]}><group position={[0,NECK_OFFSET,0]}>
    <InteractiveObject moving focused={keyboardFocused} label="Ceiling light · drag to swing, click to toggle" onHover={onHover}>
      <group onPointerDown={startDrag} onPointerMove={moveDrag}
        onPointerUp={event=>{if(gesture.current?.id===event.pointerId){event.stopPropagation();release();}}}
        onPointerCancel={release} onLostPointerCapture={release}
        onClick={event=>{event.stopPropagation();if(interactive&&!suppressClick.current&&event.delta<=5)toggle();}}>
        <primitive object={model}/>
      </group>
    </InteractiveObject>
    <primitive object={lightTarget}/>
    <spotLight userData={{cacheStationaryShadow:true}} ref={spot} position={lightPosition} target={lightTarget} color="#ffd09a" intensity={on?65:0} distance={14} decay={2}
      angle={Math.PI/3} penumbra={1} castShadow shadow-mapSize={[512,512]}
      shadow-camera-near={.1} shadow-camera-far={14} shadow-normalBias={.025} shadow-bias={-.0001}/>
    <pointLight ref={fill} position={bulb} color="#ffd09a" intensity={on?3:0} distance={5} decay={2}/>
    </group></group>
  </group>;
}
