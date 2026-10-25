import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function Plant() {
  const {scene}=useLoader(GLTFLoader,'/models/plant/optimized.gltf');
  const model=useMemo(()=>{
    const clone=scene.clone(true);
    const bounds=new Box3().setFromObject(clone);
    const center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
    const scale=Math.min(4.2/size.y,2.8/Math.max(size.x,size.z));
    clone.scale.multiplyScalar(scale);
    clone.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    clone.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
    return clone;
  },[scene]);
  return <group position={[6.8,-4.8,-.45]}><primitive object={model}/></group>;
}
