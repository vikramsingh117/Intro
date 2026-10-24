import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const PLANE_SIZE = 1.5;
const FLIGHT_SPEED = .18;

export default function FlyingPlane({ active, reduced, settings }) {
  const { scene } = useLoader(GLTFLoader, '/models/plane/scene.gltf');
  const { gl, invalidate } = useThree();
  const aircraft = useRef(null), elapsed = useRef(22);
  const [visible,setVisible] = useState(true);
  const { model, materials } = useMemo(() => {
    const model = scene.clone(true), materials=[];
    const bounds = new Box3().setFromObject(model);
    const center = bounds.getCenter(new Vector3());
    const extent = bounds.getSize(new Vector3());
    const scale = PLANE_SIZE / Math.max(extent.x,extent.y,extent.z);
    model.scale.multiplyScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    model.traverse(node => {
      if(!node.isMesh)return;
      const tune=original=>{
        const material=original.clone();
        // A faint cool fill keeps the silhouette readable against the night sky.
        material.emissive.set('#657b95');material.emissiveIntensity=.18;
        materials.push(material);return material;
      };
      node.material=Array.isArray(node.material)?node.material.map(tune):tune(node.material);
    });
    return {model,materials};
  },[scene]);
  const route = useMemo(() => {
    const right = new Vector3(settings.cameraZ-settings.targetZ,0,settings.targetX-settings.cameraX).normalize();
    return {right, center:new Vector3(settings.targetX,settings.y+5,settings.targetZ), yaw:Math.atan2(-right.x,-right.z)};
  },[settings]);
  useEffect(()=>()=>materials.forEach(material=>material.dispose()),[materials]);
  useEffect(()=>{
    let intersecting=true;
    const update=()=>setVisible(intersecting&&!document.hidden);
    const observer=new IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;update();});
    observer.observe(gl.domElement);document.addEventListener('visibilitychange',update);update();
    return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
  },[gl]);
  useEffect(()=>{invalidate();},[active,reduced,visible,route,invalidate]);
  useFrame((state,delta)=>{
    if(!aircraft.current)return;
    const moving=active&&visible&&!reduced;
    if(moving)elapsed.current=(elapsed.current+Math.min(delta,.05)*FLIGHT_SPEED)%48;
    const offset=reduced?0:elapsed.current-24;
    aircraft.current.position.copy(route.center).addScaledVector(route.right,offset);
    aircraft.current.rotation.set(0,route.yaw,reduced?0:Math.sin(elapsed.current*.18)*.025);
    if(moving)state.invalidate();
  });
  return <group ref={aircraft} scale={.65} position={route.center} rotation={[0,route.yaw,0]}>
    <primitive object={model}/>
    <group scale={PLANE_SIZE / 3.2}>
    {/* Short twin contrails, widening and fading behind the direction of travel. */}
    {[-.55,.55].map(x => <group key={x}>
      {Array.from({length:12},(_,index) => <mesh key={index}
        position={[x,-.12,.65+index*.24]} rotation={[Math.PI/2,0,0]} raycast={()=>null}>
        <cylinderGeometry args={[.012+index*.003,.015+index*.003,.25,6]}/>
        <meshBasicMaterial color="#c3d2df" transparent opacity={.16*(1-index/12)**1.5} depthWrite={false} toneMapped={false}/>
      </mesh>)}
    </group>)}
    <mesh position={[-1.48,-.12,-.2]}><sphereGeometry args={[.016,8,6]}/><meshBasicMaterial color="#ff6259" toneMapped={false}/></mesh>
    <mesh position={[1.48,-.12,-.2]}><sphereGeometry args={[.016,8,6]}/><meshBasicMaterial color="#8ee6ac" toneMapped={false}/></mesh>
    <mesh position={[0,.15,1.05]}><sphereGeometry args={[.012,8,6]}/><meshBasicMaterial color="#e4ecff" toneMapped={false}/></mesh>
    </group>
  </group>;
}
