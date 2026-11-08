import { useMemo } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { HOOP, hoopForWidth } from './basketball.mjs';

export default function BasketballHoop() {
  const hoop = useThree(state => hoopForWidth(state.size.width));
  const { scene } = useLoader(GLTFLoader, '/models/basketball-hoop/scene.gltf');
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } });
    return copy;
  }, [scene]);
  return <group position={[hoop.x, hoop.y, hoop.z]} rotation={[0, hoop.boardAxis === 'z' ? -Math.PI / 2 : 0, 0]}>
    <group position={[-HOOP.x, -HOOP.y, -HOOP.z]}>
    <mesh position={[HOOP.boardX, HOOP.boardY, HOOP.z]} castShadow receiveShadow>
      <boxGeometry args={[HOOP.boardDepth, HOOP.boardHeight, HOOP.boardWidth]} />
      <meshStandardMaterial color="#d6d2bb" roughness={.8} />
    </mesh>
    {/* Inset red target rectangle faces into the room (+X). */}
    <group position={[HOOP.boardX + .065, HOOP.boardY, HOOP.z]} scale={[1, .5, .5]}>
      {[-.53, .53].map(z => <mesh key={`v${z}`} position={[0, 0, z]}><boxGeometry args={[.012, .87, .055]}/><meshStandardMaterial color="#a5392b"/></mesh>)}
      {[-.435, .435].map(y => <mesh key={`h${y}`} position={[0, y, 0]}><boxGeometry args={[.012, .055, 1.11]}/><meshStandardMaterial color="#a5392b"/></mesh>)}
    </group>
    <primitive object={model} position={[HOOP.x, HOOP.y - HOOP.assetRimY * HOOP.scale, HOOP.z]} rotation={[0, Math.PI, 0]} scale={HOOP.scale}/>
    </group>
  </group>;
}
