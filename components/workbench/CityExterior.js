// Loads and renders the optimized night city together with bloom, antialiasing, and optional glasses passes.
// WorkbenchScene and CityStudio share this component, so resize and postprocessing state remain self-contained.
import { useEffect, useMemo, useRef } from 'react';
import CityFog from './CityFog';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, Vector2, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import LensPixelatedPass from './LensPixelatedPass';
import LensCrayonPass from './LensCrayonPass';
import LensSketchPass from './LensSketchPass';

export function NightEffects({ optimised = false, exposure = .85, glow = .55, pixelLens = false, crayonLens = false, sketchLens = false, glassesLeaving = false, lensSettings }) {
  const { gl, scene, camera, size, invalidate } = useThree();
  const get = useThree(state => state.get);
  const dpr = useThree(state => state.viewport.dpr);
  const pipeline = useRef(null);
  const bloomPass = useRef(null);
  const pixelPass = useRef(null);
  const crayonPass = useRef(null);
  const sketchPass = useRef(null);
  const lensMotion = useRef({ mode:'idle', elapsed:0 });
  const nonBlurLens = pixelLens || crayonLens || sketchLens;
  useEffect(() => {
    if(optimised)return;
    const size = get().size;
    const composer = new EffectComposer(gl);
    const render = new RenderPass(scene, camera);
    // Only HDR highlights bloom, keeping dark surfaces and lettering readable.
    const bloom = new UnrealBloomPass(new Vector2(size.width, size.height), .55, .45, 1.05);
    bloomPass.current = bloom;
    const pixel = new LensPixelatedPass(7, scene, camera, { normalEdgeStrength: .35, depthEdgeStrength: .45 });
    pixel.enabled = false;
    pixel.setLensLayout(size.width, size.height, size.width <= 760);
    pixelPass.current = pixel;
    const crayon = new LensCrayonPass(scene, camera, { normalEdgeStrength: .68, depthEdgeStrength: .76 });
    crayon.enabled = false;
    crayon.setLensLayout(size.width, size.height, size.width <= 760);
    crayonPass.current = crayon;
    const sketch = new LensSketchPass(scene, camera, { normalEdgeStrength: .82, depthEdgeStrength: .92 });
    sketch.enabled = false;
    sketch.setLensLayout(size.width, size.height, size.width <= 760);
    sketchPass.current = sketch;
    const output = new OutputPass();
    const smaa = new SMAAPass(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
    // SMAA operates on the final display colors, after bloom and tone mapping.
    // Its embedded lookup images load asynchronously; wake the demand renderer when ready.
    smaa.enabled = false;
    const lookupImages = [smaa.areaTexture.image, smaa.searchTexture.image];
    const enableSmaa = () => {
      if (lookupImages.every(image => image.complete && image.naturalWidth > 0)) {
        smaa.enabled = true;
        invalidate();
      }
    };
    lookupImages.forEach(image => image.addEventListener('load', enableSmaa));
    enableSmaa();
    composer.addPass(render);
    composer.addPass(bloom);
    composer.addPass(pixel);
    composer.addPass(crayon);
    composer.addPass(sketch);
    composer.addPass(output);
    composer.addPass(smaa);
    composer.setSize(size.width, size.height);
    pipeline.current = composer;
    invalidate();
    return () => {
      pipeline.current = null;
      bloomPass.current = null;
      pixelPass.current = null;
      crayonPass.current = null;
      sketchPass.current = null;
      lookupImages.forEach(image => image.removeEventListener('load', enableSmaa));
      render.dispose(); bloom.dispose(); pixel.dispose(); crayon.dispose(); sketch.dispose(); output.dispose(); smaa.dispose(); composer.dispose();
    };
  }, [gl, scene, camera, get, invalidate, optimised]);
  useEffect(() => {
    // Resize existing render targets instead of rebuilding shaders and SMAA textures.
    // Keep the postprocessing targets at the renderer resolution when a close-up changes DPR.
    pipeline.current?.setPixelRatio(dpr);
    pipeline.current?.setSize(size.width, size.height);
    pixelPass.current?.setLensLayout(size.width, size.height, size.width <= 760);
    crayonPass.current?.setLensLayout(size.width, size.height, size.width <= 760);
    sketchPass.current?.setLensLayout(size.width, size.height, size.width <= 760);
    invalidate();
  }, [size.width, size.height, dpr, invalidate, optimised]);
  useEffect(() => {
    if (pixelPass.current) pixelPass.current.enabled = pixelLens;
    invalidate();
  }, [pixelLens, invalidate, optimised]);
  useEffect(() => {
    if (crayonPass.current) crayonPass.current.enabled = crayonLens;
    invalidate();
  }, [crayonLens, invalidate, optimised]);
  useEffect(() => {
    if (sketchPass.current) sketchPass.current.enabled = sketchLens;
    invalidate();
  }, [sketchLens, invalidate, optimised]);
  useEffect(() => {
    const passes=[pixelPass.current,crayonPass.current,sketchPass.current];
    if(glassesLeaving){
      lensMotion.current={mode:'exit',elapsed:0};
      passes.forEach(pass=>{pass?.setLensCenterY(.5);pass?.setLensOpacity(1);});
    }else if(nonBlurLens){
      lensMotion.current={mode:'enter',elapsed:0};
      passes.forEach(pass=>{pass?.setLensCenterY(-.35);pass?.setLensOpacity(.35);});
    }else{
      lensMotion.current={mode:'idle',elapsed:0};
      passes.forEach(pass=>{pass?.setLensCenterY(.5);pass?.setLensOpacity(1);});
    }
    invalidate();
  }, [glassesLeaving,nonBlurLens,invalidate]);
  useEffect(() => {
    crayonPass.current?.updateSettings(lensSettings?.crayon);
    sketchPass.current?.updateSettings(lensSettings?.sketch);
    invalidate();
  }, [lensSettings, invalidate, optimised]);
  useEffect(() => {
    gl.toneMappingExposure = exposure;
    if (bloomPass.current) bloomPass.current.strength = glow;
    invalidate();
  }, [gl, exposure, glow, size.width, size.height, invalidate, optimised]);
  useFrame((state, delta) => {
    const motion=lensMotion.current;
    if(motion.mode!=='idle'){
      motion.elapsed+=Math.min(delta,.05);
      const duration=motion.mode==='enter' ? .7 : .5;
      const progress=Math.min(1,motion.elapsed/duration);
      const eased=motion.mode==='enter'?1-(1-progress)**3:progress*progress;
      const center=motion.mode==='enter'?-.35+eased*.85:.5-eased*.85;
      const opacity=motion.mode==='enter' ? .35+eased*.65 : 1-eased*.65;
      [pixelPass.current,crayonPass.current,sketchPass.current].forEach(pass=>{pass?.setLensCenterY(center);pass?.setLensOpacity(opacity);});
      if(progress<1)state.invalidate();else motion.mode='idle';
    }
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
    onReady?.(true);
  }, [invalidate, onReady]);
  useEffect(() => () => model.traverse(node => {
    if (node.isMesh) (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => material.dispose());
  }), [model]);
  useEffect(() => {
    model.traverse(node => { if(node.isMesh) (Array.isArray(node.material)?node.material:[node.material]).forEach(material=>{material.emissiveIntensity=settings.emissive;}); });
    invalidate();
  }, [model, settings.emissive, invalidate]);
  const base = useMemo(() => new Box3().setFromObject(model).min.y, [model]);
  return <group position={[settings.x, settings.y, settings.z]}>
    <group scale={settings.scale} rotation={[0,settings.rotation*Math.PI/180,0]}><primitive object={model} /><CityFog base={base} settings={settings} /></group>
    <pointLight userData={{cacheStationaryShadow:true}} position={[-5, 10, 8]} color="#ffd39a" intensity={settings.warm} castShadow shadow-intensity={settings.shadows} shadow-mapSize={[512, 512]} shadow-bias={-.001} shadow-normalBias={.015} distance={40} decay={2} />
    <pointLight position={[6, 8, -3]} color="#93c9dd" intensity={settings.cool} distance={40} decay={2} />
  </group>;
}
