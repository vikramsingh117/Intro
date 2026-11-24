// Loads and renders the shared city together with bloom, antialiasing, and optional glasses passes.
// WorkbenchScene and CityStudio share this component, so resize and postprocessing state remain self-contained.
import { useEffect, useMemo, useRef } from 'react';
import CityFog from './CityFog';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { AdditiveBlending, Box3, CanvasTexture, SRGBColorSpace, TextureLoader, Vector2, Vector3 } from 'three';
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

const CITY_RAIN=Array.from({length:64},(_,index)=>({
  x:-8+(index*2.37)%16,
  y:-4+(index*.91)%10,
  depth:3+(index*1.73)%14,
  speed:5.5+(index%7)*.55,
  length:.22+(index%5)*.045,
}));

function CityRain({ reduced }) {
  const drops=useRef([]),phases=useRef(CITY_RAIN.map(drop=>drop.y));
  const {camera,invalidate}=useThree();
  const vectors=useMemo(()=>({forward:new Vector3(),right:new Vector3()}),[]);
  useEffect(()=>{invalidate();},[invalidate,reduced]);
  useFrame((state,delta)=>{
    camera.getWorldDirection(vectors.forward);
    vectors.right.crossVectors(vectors.forward,camera.up).normalize();
    drops.current.forEach((drop,index)=>{
      if(!drop)return;
      if(!reduced){phases.current[index]-=Math.min(delta,.05)*CITY_RAIN[index].speed;if(phases.current[index]<-4)phases.current[index]+=10;}
      drop.position.copy(camera.position)
        .addScaledVector(vectors.right,CITY_RAIN[index].x)
        .addScaledVector(camera.up,phases.current[index])
        .addScaledVector(vectors.forward,CITY_RAIN[index].depth);
    });
    if(!reduced)state.invalidate();
  });
  return <group>{CITY_RAIN.map((drop,index)=><mesh key={index} ref={node=>{drops.current[index]=node;}} raycast={()=>null} rotation={[0,0,-.12]}>
    <boxGeometry args={[.018,drop.length,.014]}/><meshBasicMaterial color="#b8d1d3" transparent opacity={.58} depthWrite={false} toneMapped={false}/>
  </mesh>)}</group>;
}

const CITY_TREATMENTS={
  '2021':{emissive:.06,warm:1.35,cool:.12,warmColor:'#f4c66f',coolColor:'#f2dfae'},
  '2025':{emissive:.42,warm:.28,cool:.82,warmColor:'#d7c49c',coolColor:'#8fbfc8'},
  '2026':{emissive:1,warm:1,cool:1,warmColor:'#ffd39a',coolColor:'#93c9dd'},
};

function radialTexture(stops) {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=256;
  const context=canvas.getContext('2d'),gradient=context.createRadialGradient(128,128,0,128,128,128);
  stops.forEach(([offset,color])=>gradient.addColorStop(offset,color));
  context.fillStyle=gradient;context.fillRect(0,0,256,256);
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture;
}

const SUN_POSITION=[-5.1,8.15,-18];
const MOON_POSITION=[-5.8,7.65,-18.8];
const SUN_GHOSTS=[
  {factor:.62,size:.11,texture:2,color:'#f3d58a',opacity:.18},
  {factor:.3,size:.16,texture:1,color:'#fff1bd',opacity:.2},
  {factor:-.14,size:.1,texture:2,color:'#edcf82',opacity:.16},
  {factor:-.48,size:.18,texture:2,color:'#d8b86b',opacity:.14},
  {factor:-.82,size:.09,texture:1,color:'#f1d28b',opacity:.13},
  {factor:-1.08,size:.24,texture:3,color:'#cda95c',opacity:.11},
];

function SunGlare() {
  // Three's Lensflare writes a magenta occlusion probe into the active framebuffer.
  // The composer renders into a floating-point target, where that probe can return as
  // cyan/magenta rings. Ordinary warm sprites keep the glare color-stable through bloom.
  const textures=useMemo(()=>[
    radialTexture([[0,'#fffef4'],[.12,'#fff1bd'],[.42,'#e8c57470'],[1,'#c99f4200']]),
    radialTexture([[0,'#fff9e2dd'],[.18,'#f3d58a77'],[.55,'#d2ad5835'],[1,'#aa823000']]),
    radialTexture([[0,'#fff8dd00'],[.38,'#fff1bd00'],[.49,'#fff1bdb0'],[.58,'#d8b86b55'],[.72,'#b78e3500'],[1,'#b78e3500']]),
    radialTexture([[0,'#fff8dd00'],[.58,'#e7c77700'],[.7,'#e7c77766'],[.78,'#c49b4540'],[.9,'#ad843000'],[1,'#ad843000']]),
  ],[]);
  const ghosts=useRef([]);
  const vectors=useMemo(()=>({sun:new Vector3(),world:new Vector3()}),[]);
  useEffect(()=>()=>textures.forEach(texture=>texture.dispose()),[textures]);
  useFrame(({camera})=>{
    vectors.sun.set(...SUN_POSITION).project(camera);
    const visible=vectors.sun.z>-1&&vectors.sun.z<1&&Math.abs(vectors.sun.x)<1.15&&Math.abs(vectors.sun.y)<1.15;
    const distance=2.4;
    const halfHeight=Math.tan((camera.fov||45)*Math.PI/360)*distance;
    const halfWidth=halfHeight*(camera.aspect||1);
    ghosts.current.forEach((ghost,index)=>{
      if(!ghost)return;
      ghost.visible=visible;
      if(!visible)return;
      const spec=SUN_GHOSTS[index];
      vectors.world.set(vectors.sun.x*spec.factor*halfWidth,vectors.sun.y*spec.factor*halfHeight,-distance).applyMatrix4(camera.matrixWorld);
      ghost.position.copy(vectors.world);
      const size=spec.size*halfHeight;
      ghost.scale.set(size,size,1);
    });
  });
  return <>
    <sprite position={SUN_POSITION} scale={[1.85,1.85,1]} raycast={()=>null}>
      <spriteMaterial map={textures[0]} color="#f5d27e" transparent opacity={.58} depthTest depthWrite={false} toneMapped={false} blending={AdditiveBlending}/>
    </sprite>
    <sprite position={SUN_POSITION} scale={[1.38,1.38,1]} raycast={()=>null}>
      <spriteMaterial map={textures[2]} color="#f2d486" transparent opacity={.32} depthTest depthWrite={false} toneMapped={false} blending={AdditiveBlending}/>
    </sprite>
    {SUN_GHOSTS.map((ghost,index)=><sprite key={ghost.factor} ref={node=>{ghosts.current[index]=node;}} visible={false} raycast={()=>null}>
      <spriteMaterial map={textures[ghost.texture]} color={ghost.color} transparent opacity={ghost.opacity} depthTest={false} depthWrite={false} toneMapped={false} blending={AdditiveBlending}/>
    </sprite>)}
  </>;
}

function crescentTexture() {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=256;
  const context=canvas.getContext('2d');
  context.fillStyle='#ffffff';
  context.beginPath();context.arc(128,128,86,0,Math.PI*2);context.fill();
  context.globalCompositeOperation='destination-out';
  context.beginPath();context.arc(164,112,82,0,Math.PI*2);context.fill();
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture;
}

function CrescentMoon({ lighting=true }) {
  const textures=useMemo(()=>[
    crescentTexture(),
    radialTexture([[0,'#f4f7ffbb'],[.18,'#c8dbff80'],[.48,'#7ba5e236'],[1,'#5784c000']]),
  ],[]);
  useEffect(()=>()=>textures.forEach(texture=>texture.dispose()),[textures]);
  return <group>
    <sprite position={MOON_POSITION} scale={[1.48,1.48,1]} raycast={()=>null}>
      <spriteMaterial map={textures[1]} color="#c9dcff" transparent opacity={.46} depthWrite={false} toneMapped={false} blending={AdditiveBlending}/>
    </sprite>
    <sprite position={MOON_POSITION} scale={[.78,.78,1]} raycast={()=>null}>
      <spriteMaterial map={textures[0]} color="#dbe8ff" transparent depthWrite={false} toneMapped={false} rotation={-.18}/>
    </sprite>
    {lighting&&<pointLight position={MOON_POSITION} color="#9ebfff" intensity={12} distance={32} decay={2}/>}
  </group>;
}

function CelestialBody({ year, glareActive=false, lighting=true }) {
  if(year==='2021')return <>
    <group position={SUN_POSITION}>
      <mesh raycast={()=>null}><sphereGeometry args={[.5,32,20]}/><meshBasicMaterial color="#ffdc86" toneMapped={false}/></mesh>
      {lighting&&<pointLight color="#ffd18a" intensity={68} distance={48} decay={2}/>}
    </group>
    {glareActive&&<SunGlare/>}
  </>;
  if(year==='2026')return <CrescentMoon lighting={lighting}/>;
  return null;
}

const RAIN_CLOUDS=[
  {position:[-5.8,6.15,-14.5],size:[5.3,2.14],asset:0,speed:.055,phase:.2,tilt:-.025},
  {position:[-2.1,5.2,-11.5],size:[4.7,1.56],asset:1,speed:.07,phase:1.6,tilt:.018},
  {position:[-9.5,7.15,-20],size:[7.1,2.86],asset:0,speed:.04,phase:2.8,tilt:.012},
  {position:[1.2,6.55,-21.5],size:[5.9,1.96],asset:1,speed:.05,phase:4.1,tilt:-.016},
];
const CLOUD_LAYERS=[
  {position:[-.08,-.11,-.32],scale:1.08,color:'#536a70',opacity:.3},
  {position:[0,0,0],scale:1,color:'#ffffff',opacity:.96},
  {position:[-.07,.1,.2],scale:.965,color:'#d9e3e2',opacity:.16,additive:true},
  {position:[.08,-.17,.3],scale:.94,color:'#40565c',opacity:.16},
];

function RainClouds({ reduced }) {
  const clouds=useRef([]),invalidate=useThree(state=>state.invalidate);
  const textures=useLoader(TextureLoader,['/images/rain-cloud-bank.png','/images/rain-cloud-wisp.png']);
  const gl=useThree(state=>state.gl);
  useEffect(()=>{
    const anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());
    textures.forEach(texture=>{texture.colorSpace=SRGBColorSpace;texture.anisotropy=anisotropy;texture.needsUpdate=true;});
    invalidate();
  },[textures,gl,invalidate]);
  useEffect(()=>{invalidate();},[invalidate,reduced]);
  useFrame((state)=>{
    if(reduced)return;
    const time=state.clock.elapsedTime;
    clouds.current.forEach((cloud,index)=>{
      if(!cloud)return;
      const spec=RAIN_CLOUDS[index];
      cloud.position.x=spec.position[0]+Math.sin(time*spec.speed+spec.phase)*.7;
      cloud.position.y=spec.position[1]+Math.sin(time*spec.speed*.8+spec.phase)*.08;
      cloud.position.z=spec.position[2]+Math.cos(time*spec.speed*.7+spec.phase)*.28;
    });
    state.invalidate();
  });
  return <group name="2025-rain-clouds">{RAIN_CLOUDS.map((cloud,index)=><group key={index} ref={node=>{clouds.current[index]=node;}} position={cloud.position}>
    {CLOUD_LAYERS.map((layer,layerIndex)=><sprite key={layerIndex} position={layer.position} scale={[cloud.size[0]*layer.scale,cloud.size[1]*layer.scale,1]} renderOrder={20+layerIndex} raycast={()=>null}>
      <spriteMaterial map={textures[cloud.asset]} color={layer.color} transparent opacity={layer.opacity} depthWrite={false} toneMapped={false} rotation={cloud.tilt} blending={layer.additive?AdditiveBlending:undefined}/>
    </sprite>)}
  </group>)}</group>;
}

export default function CityExterior({ onReady, settings, year='2026', outside=false, rain=false, reduced=false, optimised=false }) {
  const { scene } = useLoader(GLTFLoader, '/models/city/optimized.gltf');
  const { invalidate } = useThree();
  const treatment=CITY_TREATMENTS[year]||CITY_TREATMENTS['2026'];
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
      node.castShadow = !optimised;
      node.receiveShadow = !optimised;
      const tune = source => {
        const material = source.clone();

        return material;
      };
      node.material = Array.isArray(node.material) ? node.material.map(tune) : tune(node.material);
    });
    return clone;
  }, [scene,optimised]);
  useEffect(() => {
    invalidate();
    onReady?.(true);
  }, [invalidate, onReady]);
  useEffect(() => () => model.traverse(node => {
    if (node.isMesh) (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => material.dispose());
  }), [model]);
  useEffect(() => {
    model.traverse(node => { if(node.isMesh) (Array.isArray(node.material)?node.material:[node.material]).forEach(material=>{material.emissiveIntensity=settings.emissive*treatment.emissive;}); });
    invalidate();
  }, [model,settings.emissive,treatment.emissive,invalidate]);
  const base = useMemo(() => new Box3().setFromObject(model).min.y, [model]);
  const heightScale=settings.heightScale??1;
  return <>
  <group position={[settings.x,settings.y,settings.z]}>
    <group rotation={[(settings.tilt??0)*Math.PI/180,settings.rotation*Math.PI/180,0]}>
      <group scale={[settings.scale,settings.scale*heightScale,settings.scale]}><primitive object={model}/></group>
      <group scale={settings.scale}><CityFog base={base*heightScale} settings={settings} year={year}/></group>
    </group>
    {!optimised&&<><pointLight userData={{cacheStationaryShadow:true}} position={[-5,10,8]} color={treatment.warmColor} intensity={settings.warm*treatment.warm} castShadow shadow-intensity={settings.shadows} shadow-mapSize={[512,512]} shadow-bias={-.001} shadow-normalBias={.015} distance={40} decay={2}/>
    <pointLight position={[6,8,-3]} color={treatment.coolColor} intensity={settings.cool*treatment.cool} distance={40} decay={2}/></>}
  </group>
  <CelestialBody year={year} glareActive={outside&&!optimised} lighting={!optimised}/>
  {year==='2025'&&<RainClouds reduced={reduced||optimised}/>}
  {rain&&<CityRain reduced={reduced||optimised}/>}
  </>;
}
