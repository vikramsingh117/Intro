import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box3, Vector3 } from 'three';

// Static prop: no pointer handlers or keyboard interaction.
export default function Keyboard() {
  const { scene } = useLoader(GLTFLoader, '/models/keyboard/optimized.gltf');
  const { model, scale, offset } = useMemo(() => {
    const model = scene.clone(true);
    model.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
    model.updateMatrixWorld(true);
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    return { model, scale:2.45 / box.getSize(new Vector3()).x, offset:new Vector3(-center.x, -box.min.y, -center.z) };
  }, [scene]);
  return <group position={[1.5, -1.49, 1.12]} scale={scale}><primitive object={model} position={offset} /></group>;
}
