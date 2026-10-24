import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, Vector2, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

// The normalized station extends six units toward the room. Leave only
// 0.15 units between its near end and the outside face of the window wall.
export const SUBWAY_CENTER = [-4.6, 1.6, -9.45];
const STATION_VIEW_OFFSET = [0.04301, 0.18554, 5.9039];
export const WINDOW_CAMERA = SUBWAY_CENTER.map((value, axis) => value + STATION_VIEW_OFFSET[axis]);

export function NightEffects({ exposure = .85, glow = .55 }) {
  const { gl, scene, camera, size, invalidate } = useThree();
  const pipeline = useRef(null);
  const bloomPass = useRef(null);
  useEffect(() => {
    const composer = new EffectComposer(gl);
    const render = new RenderPass(scene, camera);
    // Only HDR highlights bloom, keeping dark surfaces and lettering readable.
    const bloom = new UnrealBloomPass(new Vector2(size.width, size.height), .55, .45, 1.05);
    bloomPass.current = bloom;
    const output = new OutputPass();
    composer.addPass(render);
    composer.addPass(bloom);
    composer.addPass(output);
    composer.setSize(size.width, size.height);
    pipeline.current = composer;
    invalidate();
    return () => {
      pipeline.current = null;
      bloomPass.current = null;
      render.dispose(); bloom.dispose(); output.dispose(); composer.dispose();
    };
  }, [gl, scene, camera, size.width, size.height, invalidate]);
  useEffect(() => {
    gl.toneMappingExposure = exposure;
    if (bloomPass.current) bloomPass.current.strength = glow;
    invalidate();
  }, [gl, exposure, glow, size.width, size.height, invalidate]);
  useFrame((state, delta) => {
    if (pipeline.current) pipeline.current.render(delta);
    else gl.render(scene, camera);
  }, 1);
  return null;
}
export default function SubwayExterior({ onReady, lighting }) {
  const { scene } = useLoader(GLTFLoader, '/models/subway/runtime.gltf');
  const { invalidate } = useThree();
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const extent = bounds.getSize(new Vector3());
    const scale = 12 / Math.max(extent.x, extent.y, extent.z);
    clone.scale.multiplyScalar(scale);
    clone.position.sub(center.multiplyScalar(scale));
    clone.traverse(node => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      const tune = source => {
        const material = source.clone();
        if (material.emissiveMap) {
          material.emissiveIntensity = material.name === 'lights' ? 4 : Math.min(material.emissiveIntensity, 2.5);
        }
        return material;
      };
      node.material = Array.isArray(node.material) ? node.material.map(tune) : tune(node.material);
    });
    return clone;
  }, [scene]);
  useEffect(() => {
    invalidate();
    onReady(true);
  }, [invalidate, onReady]);
  useEffect(() => () => model.traverse(node => {
    if (node.isMesh) (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => material.dispose());
  }), [model]);
  return <group position={SUBWAY_CENTER}>
    <primitive object={model} />
    <pointLight position={[-.6, 1.2, 1]} color="#ffd39a" intensity={lighting.warm} castShadow shadow-intensity={lighting.shadows} shadow-mapSize={[512, 512]} shadow-bias={-.001} shadow-normalBias={.015} distance={6} decay={2} />
    <pointLight position={[.6, .8, -1]} color="#93c9dd" intensity={lighting.cool} distance={5} decay={2} />
  </group>;
}
