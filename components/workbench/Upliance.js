import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { loadArtworkImage } from './loadArtwork.mjs';
import { UPLIANCE_ARTWORK, selectArtwork, drawUplianceWork } from './uplianceArtwork.mjs';
import { UPLIANCE_WORK } from './uplianceWork';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, BoxHelper, CanvasTexture, Group, MathUtils, Mesh, MeshStandardMaterial, Object3D, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const noRaycast=()=>{};
const LEDS=Array.from({length:56},(_,i)=>i*Math.PI*2/56);
export default function Upliance({ celebrating=false, keyboardFocused=false, registerRoomAction, placement=DEFAULT_PROP_PLACEMENT.upliance, reduced=false, interactive=true, onHover=()=>{}, focused=false, zoomComplete=false, preloadArtwork=false, onReady, workPage=0, onSelect=()=>{}, controlsRef }) {
  const {scene}=useLoader(GLTFLoader,'/models/upliance/interactive.glb');
  const display=useLoader(TextureLoader,'/images/upliance-display.svg');
  // Showcase artwork must never suspend the appliance itself.
  const [artworkImages,setArtworkImages]=useState({});
  useEffect(()=>{onReady?.();},[onReady]);
  useEffect(()=>{
    if(!preloadArtwork)return;
    let cancelled=false;
    const idle=()=>new Promise(resolve=>{
      if(window.requestIdleCallback)window.requestIdleCallback(resolve,{timeout:1500});
      else window.setTimeout(resolve,50);
    });
    // Last priority: decode one SVG at a time, yielding between frames.
    // This runs independently of whether the appliance is ever opened.
    async function preload(){
      const pages=UPLIANCE_ARTWORK.map(page=>page.urls), failed=[];
      const publish=(url,image)=>setArtworkImages(current=>({...current,[url]:image}));
      for(let frame=0;frame<Math.max(...pages.map(urls=>urls.length));frame++){
        for(const urls of pages){
          const url=urls[frame];if(!url)continue;
          await idle();if(cancelled)return;
          const image=await loadArtworkImage(url);
          if(cancelled)return;
          if(image)publish(url,image);else failed.push(url);
        }
      }
      for(const url of failed){
        await idle();if(cancelled)return;
        const image=await loadArtworkImage(url);
        if(cancelled)return;
        if(image)publish(url,image);else console.warn(`Unable to load Upliance artwork: ${url}`);
      }
    }
    preload();
    return ()=>{cancelled=true;};
  },[preloadArtwork]);
  display.colorSpace=SRGBColorSpace;
  const {invalidate,gl,camera,size,scene:renderScene}=useThree();
  const projectedEdge=useMemo(()=>new Vector3(),[]);
  const [hovered,setHovered]=useState(false),[latched,setLatched]=useState(false);
  const panel=useRef(null);
  const hoverOutline=useRef(null);
  const [sequence,setSequence]=useState({page:workPage,frame:0});
  const frameCount=Math.max(1,UPLIANCE_ARTWORK[workPage].urls.length);
  useEffect(()=>{
    setSequence({page:workPage,frame:0});
    if(!focused||!zoomComplete||frameCount===1||reduced)return;
    const timer=window.setInterval(()=>{
      if(!document.hidden)setSequence(current=>({page:workPage,frame:(current.frame+1)%frameCount}));
    },1500);
    return ()=>window.clearInterval(timer);
  },[focused,zoomComplete,workPage,frameCount,reduced]);
  const frame=sequence.page===workPage&&zoomComplete&&!reduced?sequence.frame:0;
  const pageImage=selectArtwork(artworkImages,workPage,frame);
  const mobile=size.width<=760;
  const workTexture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=740;
    drawUplianceWork(canvas.getContext('2d'),UPLIANCE_WORK[workPage],workPage,pageImage,mobile);
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
    texture.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());
    return texture;
  },[workPage,pageImage,mobile,gl]);
  useEffect(()=>()=>workTexture.dispose(),[workTexture]);
  useEffect(()=>{invalidate();},[workTexture,invalidate]);
  const progress=useRef(0),screenMaterial=useRef(null),leds=useRef(null),spill=useRef(null),hitArea=useRef(null);
  const ledMaterial=useMemo(()=>new MeshStandardMaterial({color:'#b0d4ff',emissive:'#3878ff',emissiveIntensity:0,transparent:true,opacity:0,depthWrite:false}),[]);
  useEffect(()=>()=>ledMaterial.dispose(),[ledMaterial]);
  useLayoutEffect(()=>{const transform=new Object3D();LEDS.forEach((angle,i)=>{transform.position.set(Math.cos(angle)*9.95,0,Math.sin(angle)*9.95);transform.rotation.y=-angle;transform.updateMatrix();leds.current.setMatrixAt(i,transform.matrix);});leds.current.instanceMatrix.needsUpdate=true;invalidate();},[invalidate]);
  const active=celebrating||focused||(interactive&&(hovered||latched||keyboardFocused));
  const {model,lidPivot,scale,offset,hitSize,hitCenter,glowMaterials}=useMemo(()=>{
    const model=scene.clone(true);
    const bounds=new Box3().setFromObject(model),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
    const lid=model.getObjectByName('JarLid');
    const lidPivot=new Group();lidPivot.name='LidPivot';lidPivot.position.set(0,21,-10.2);
    model.add(lidPivot);model.updateMatrixWorld(true);lidPivot.attach(lid);
    // The original CAD screen is replaced by a flush display at the measured panel plane.
    model.getObjectByName('ScreenPanel').visible=false;
    const glowMaterials=[];
    model.getObjectByName('LightGuides').traverse(node=>{
      if(!node.isMesh)return;
      const clone=source=>{const material=source.clone();material.emissive.set('#397eff');material.emissiveIntensity=0;glowMaterials.push(material);return material;};
      node.material=Array.isArray(node.material)?node.material.map(clone):clone(node.material);
    });
    model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;node.raycast=noRaycast;}});
    return {model,lidPivot,scale:2.7/Math.max(size.x,size.z),offset:new Vector3(-center.x,-bounds.min.y,-center.z),hitSize:size,hitCenter:center,glowMaterials};
  },[scene]);
  useEffect(()=>()=>glowMaterials.forEach(material=>material.dispose()),[glowMaterials]);
  useEffect(()=>{invalidate();},[active,reduced,invalidate]);
  useEffect(()=>{if(!interactive){setHovered(false);setLatched(false);}},[interactive]);
  useEffect(()=>{
    const reset=()=>{setHovered(false);setLatched(false);};
    window.addEventListener('blur',reset);
    return ()=>window.removeEventListener('blur',reset);
  },[]);
  useLayoutEffect(()=>{
    hitArea.current.updateWorldMatrix(true,false);
    const outline=new BoxHelper(hitArea.current,'#e8c595');
    outline.material.transparent=true;outline.material.opacity=.35;outline.raycast=noRaycast;
    outline.visible=false;hoverOutline.current=outline;renderScene.add(outline);
    return ()=>{hoverOutline.current=null;renderScene.remove(outline);outline.geometry.dispose();outline.material.dispose();};
  },[renderScene,placement]);
  useEffect(()=>{
    if(hoverOutline.current)hoverOutline.current.visible=interactive&&(hovered||keyboardFocused);
    invalidate();
  },[hovered,keyboardFocused,interactive,placement,invalidate]);
  useEffect(()=>{
    const id=hitArea.current.uuid;
    if(hovered&&interactive){gl.domElement.dataset.cursorObject=id;gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change',{bubbles:true}));}
    return ()=>{
      if(gl.domElement.dataset.cursorObject===id){delete gl.domElement.dataset.cursorObject;gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change',{bubbles:true}));}
    };
  },[hovered,interactive,gl]);
  const select=useCallback(()=>{
    if(!interactive||!panel.current)return;
    panel.current.updateWorldMatrix(true,false);
    const target=panel.current.getWorldPosition(new Vector3());
    const normal=new Vector3(0,0,1).transformDirection(panel.current.matrixWorld);
    const worldScale=panel.current.getWorldScale(new Vector3());
    onHover('');onSelect({target:target.toArray(),normal:normal.toArray(),width:17.28*worldScale.x,height:10.68*worldScale.y});
  },[interactive,onHover,onSelect]);
  useEffect(()=>registerRoomAction?.('upliance',select),[registerRoomAction,select]);
  useFrame((_,dt)=>{
    if(focused && panel.current && controlsRef?.current){
      panel.current.updateWorldMatrix(true,false);camera.updateMatrixWorld();
      const corners=[[-8.64,5.34],[8.64,5.34],[8.64,-5.34],[-8.64,-5.34]].map(([x,y])=>{
        projectedEdge.set(x,y,.03).applyMatrix4(panel.current.matrixWorld).project(camera);
        return `${(projectedEdge.x+1)*size.width/2}px ${(1-projectedEdge.y)*size.height/2}px`;
      });
      const surface=controlsRef.current.querySelector('[data-display-surface]');
      surface.style.clipPath=`polygon(${corners.join(',')})`;
      projectedEdge.set(0,0,.03).applyMatrix4(panel.current.matrixWorld).project(camera);
      surface.dataset.centerX=String((projectedEdge.x+1)*size.width/2);

    }

    const target=active?1:0;
    let value=reduced?target:MathUtils.damp(progress.current,target,5,Math.min(dt,.05));
    if(Math.abs(value-target)<.001)value=target;
    progress.current=value;
    lidPivot.rotation.x=-Math.PI*.57*value;
    lidPivot.position.y=21+.7*value;
    glowMaterials.forEach(material=>{material.emissiveIntensity=3.5*value;});
    ledMaterial.opacity=value;ledMaterial.emissiveIntensity=5*value;
    if(screenMaterial.current)screenMaterial.current.opacity=value;
    if(spill.current)spill.current.intensity=1.2*value;
    if(value!==target)invalidate();
  });
  return <group position={[placement.x,placement.y,placement.z]} rotation={[0,placement.rotation*Math.PI/180,0]} scale={placement.scale}>
    <group scale={scale}><group position={offset}>
      <primitive object={model}/>
      {/* Fixed hit volume prevents the moving lid from repeatedly retriggering hover. */}
      <mesh ref={hitArea} position={hitCenter} raycast={interactive?Mesh.prototype.raycast:noRaycast}
        onPointerOver={event=>{event.stopPropagation();if(event.pointerType!=='touch'&&event.pointerType!=='pen'){setHovered(true);onHover('Upliance · explore my work');}}}
        onPointerOut={()=>{setHovered(false);onHover('');}}
        onPointerCancel={()=>{setHovered(false);setLatched(false);onHover('');}}
        onClick={event=>{event.stopPropagation();if(event.delta<=5)select();}}>
        <boxGeometry args={hitSize.toArray()}/><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false}/>
      </mesh>
      <group ref={panel} position={[18.65,12.65,10.71]} rotation={[-Math.atan2(.551928,.833892),0,0]}>
        <mesh raycast={noRaycast}><planeGeometry args={[17.28,10.68]}/><meshBasicMaterial color="#03070c" toneMapped={false}/></mesh>
        <mesh position={[0,0,.025]} raycast={noRaycast}><planeGeometry args={[17.15,10.58]}/><meshBasicMaterial ref={screenMaterial} map={focused?workTexture:display} transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
      </group>
      <group position={[0,5.65,0]}>
        {/* A shared material keeps the blue LED segments fading together. */}
        <instancedMesh ref={leds} args={[null,ledMaterial,LEDS.length]} raycast={noRaycast}>
          <boxGeometry args={[.22,.13,.48]}/>
        </instancedMesh>
      </group>
      <pointLight ref={spill} position={[0,7,0]} color="#397eff" intensity={0} distance={2.5} decay={2}/>
    </group></group>
  </group>;
}
