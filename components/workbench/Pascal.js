import { useMemo } from 'react';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';
import { useLoader } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function Pascal({ placement=DEFAULT_PROP_PLACEMENT.pascal }) {
  const {scene}=useLoader(GLTFLoader,'/models/pascal/optimized.gltf');
  const model=useMemo(()=>{
    const clone=scene.clone(true);
    const bounds=new Box3().setFromObject(clone);
    const size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
    const scale=Math.min(1.45/Math.max(size.x,size.z),1.1/size.y);
    clone.scale.multiplyScalar(scale);
    clone.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    clone.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
    return clone;
  },[scene]);
  return <group position={[placement.x,placement.y,placement.z]} rotation={[0,placement.rotation*Math.PI/180,0]} scale={placement.scale}><primitive object={model}/></group>;
}
