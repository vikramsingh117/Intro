import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box3, Vector3 } from 'three';

// Decorative radio; no audio or click interaction.
export default function Radio() {
  const { scene } = useLoader(GLTFLoader, '/models/radio/scene.gltf');
  const model = useMemo(() => {
    const clone = scene.clone(true);
    // The antenna shares the body mesh; its long wall shadow resembles a stray pole.
    clone.traverse(node => { if(node.isMesh) { node.castShadow=false; node.receiveShadow=true; } });
    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const scale = 1.3 / bounds.getSize(new Vector3()).x;
    clone.scale.multiplyScalar(scale);
    clone.position.set(-center.x*scale, -bounds.min.y*scale, -center.z*scale);
    return clone;
  }, [scene]);
  return <group position={[-3.65,-1.49,1.05]} rotation={[0,.12,0]}><primitive object={model}/></group>;
}
