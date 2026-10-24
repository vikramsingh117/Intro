import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box3, Vector3 } from 'three';

export default function Chair() {
  const { scene } = useLoader(GLTFLoader, '/models/chair/runtime.gltf');
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse(node => { if(node.isMesh) { node.castShadow=true; node.receiveShadow=true; } });
    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const scale = 4.2 / bounds.getSize(new Vector3()).y;
    clone.scale.multiplyScalar(scale);
    clone.position.set(-center.x*scale, -bounds.min.y*scale, -center.z*scale);
    return clone;
  }, [scene]);
  return <group position={[1.5,-4.8,3.65]} rotation={[0,Math.PI,0]}>
    <primitive object={model}/>
  </group>;
}
