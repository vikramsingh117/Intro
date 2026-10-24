import { useEffect, useMemo } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box3, Vector3 } from 'three';

export default function DeskLamp({ on, onToggle }) {
  const { scene } = useLoader(GLTFLoader, '/models/desk-lamp.glb');
  const { invalidate, gl } = useThree();
  const { model, scale, offset, bulb, materials } = useMemo(() => {
    const model = scene.clone(true);
    const materials = [];
    model.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true; object.receiveShadow = true;
      const clone = material => { const copy = material.clone(); materials.push(copy); return copy; };
      object.material = Array.isArray(object.material) ? object.material.map(clone) : clone(object.material);
    });
    model.updateMatrixWorld(true);
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    const scale = 2.8 / box.getSize(new Vector3()).y;
    const offset = new Vector3(-center.x, -box.min.y, -center.z);
    const bulbNode = model.getObjectByName('desk-lamp_bulb_glow');
    const bulb = new Box3().setFromObject(bulbNode).getCenter(new Vector3()).add(offset).multiplyScalar(scale);
    return { model, scale, offset, bulb, materials };
  }, [scene]);
  useEffect(() => {
    materials.forEach(material => { if (material.name.includes('bulb_glow')) material.emissiveIntensity = on ? 2.3 : 0; });
    invalidate();
  }, [on, materials, invalidate]);
  useEffect(() => () => { materials.forEach(material => material.dispose()); gl.domElement.style.cursor = ''; }, [materials, gl]);
  return <group position={[-3.35, -1.49, -.45]}>
    <group onClick={event => { event.stopPropagation(); if (event.delta <= 5) onToggle(); }}>
      <group scale={scale}><primitive object={model} position={offset} /></group>
    </group>
    <pointLight position={bulb} color="#ffc276" intensity={on ? 32 : 0} distance={8} decay={2} castShadow shadow-mapSize={[512,512]} shadow-normalBias={.03} />
  </group>;
}
