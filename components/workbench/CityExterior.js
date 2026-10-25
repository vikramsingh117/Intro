import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, Vector2, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

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
export default function CityExterior({ onReady, settings }) {
  const { scene } = useLoader(GLTFLoader, '/models/city/optimized.gltf');
  const { invalidate } = useThree();
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const extent = bounds.getSize(new Vector3());
    const scale = 20 / Math.max(extent.x, extent.y, extent.z);
    clone.scale.multiplyScalar(scale);
    clone.position.sub(center.multiplyScalar(scale));
    clone.traverse(node => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      const tune = source => {
        const material = source.clone();

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
  useEffect(() => {
    model.traverse(node => { if(node.isMesh) (Array.isArray(node.material)?node.material:[node.material]).forEach(material=>{material.emissiveIntensity=settings.emissive;}); });
    invalidate();
  }, [model, settings.emissive, invalidate]);
  return <group position={[settings.x, settings.y, settings.z]}>
    <group scale={settings.scale} rotation={[0,settings.rotation*Math.PI/180,0]}><primitive object={model} /></group>
    <pointLight position={[-5, 10, 8]} color="#ffd39a" intensity={settings.warm} castShadow shadow-intensity={settings.shadows} shadow-mapSize={[512, 512]} shadow-bias={-.001} shadow-normalBias={.015} distance={40} decay={2} />
    <pointLight position={[6, 8, -3]} color="#93c9dd" intensity={settings.cool} distance={40} decay={2} />
  </group>;
}
