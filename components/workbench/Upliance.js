import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { UPLIANCE_WORK } from './uplianceWork';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, BoxHelper, CanvasTexture, Group, MathUtils, Mesh, MeshStandardMaterial, Object3D, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const noRaycast=()=>{};
const LEDS=Array.from({length:56},(_,i)=>i*Math.PI*2/56);
const APP_FRAME_URLS=[1,2,3].map(frame=>`/images/upliance-app-sequence/0${frame}.svg`);
const APPLIANCE_FRAME_URLS=[1,3,4].map(frame=>`/images/upliance-sequence/0${frame}.svg`);
const CHATBOT_FRAME_URLS=['/images/upliance-chatbot/home.svg','/images/upliance-chatbot/chat.svg'];
const MOBILE_WORK_LINES=[
  ['I shape product behavior,','then build the experience.','','upliance touchscreen','upliance mobile app','internal AI tools'],
  ['Dynamic recipe categories','Touchscreen UI + navigation','Diet + allergen preferences','Reliable scroll restoration','React · TypeScript · WebView'],
  ['ADK cooking assistant','Recipe generation in chat','View-only archived chats','Past conversations accessible','React · Redux · GraphQL'],
  ['Session inspection','Recipe timing views','Resource sync workflow','Frontend + API integration'],
];
export default function Upliance({ celebrating=false, keyboardFocused=false, registerRoomAction, placement=DEFAULT_PROP_PLACEMENT.upliance, reduced=false, interactive=true, onHover=()=>{}, focused=false, zoomComplete=false, preloadArtwork=false, onReady, workPage=0, onSelect=()=>{}, controlsRef }) {
  const {scene}=useLoader(GLTFLoader,'/models/upliance/interactive.glb');
  const display=useLoader(TextureLoader,'/images/upliance-display.svg');
  // Showcase artwork must never suspend the appliance itself.
  const [loadedFrames,setLoadedFrames]=useState({});
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
      for(const [page,urls] of [APPLIANCE_FRAME_URLS,APP_FRAME_URLS,CHATBOT_FRAME_URLS].entries()){
        const frames=[];
        for(const url of urls){
          await idle();
          if(cancelled)return;
          const image=new Image();
          image.fetchPriority='low';
          image.src=url;
          try{await image.decode();frames.push({image});}
          catch{frames.push({image:null});}
          if(cancelled)return;
        }
        setLoadedFrames(current=>({...current,[page]:frames}));
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
  const frameCount=workPage===0?APPLIANCE_FRAME_URLS.length:workPage===1?APP_FRAME_URLS.length:workPage===2?CHATBOT_FRAME_URLS.length:1;
  useEffect(()=>{
    setSequence({page:workPage,frame:0});
    if(!focused||!zoomComplete||frameCount===1||reduced)return;
    const timer=window.setInterval(()=>{
      if(!document.hidden)setSequence(current=>({page:workPage,frame:(current.frame+1)%frameCount}));
    },1500);
    return ()=>window.clearInterval(timer);
  },[focused,zoomComplete,workPage,frameCount,reduced]);
  const activeFrames=loadedFrames[workPage];
  const workTextures=useMemo(()=>(activeFrames||[undefined]).map(imageTexture=>{
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=740;
    const ctx=canvas.getContext('2d'),page=UPLIANCE_WORK[workPage];
    const mobile=size.width<=760;
    const lines=mobile?MOBILE_WORK_LINES[workPage]:page.lines;
    const pageImage=imageTexture?.image;
    const hasImage=Boolean(pageImage?.width&&pageImage?.height);
    ctx.fillStyle='#eaf0e8';ctx.fillRect(0,0,1200,740);
    ctx.fillStyle='#214c69';ctx.font=`${mobile?30:24}px monospace`;ctx.fillText(page.subtitle,80,66);
    ctx.fillStyle='#102e43';ctx.font=`bold ${mobile?(workPage===1?48:56):44}px sans-serif`;ctx.fillText(page.title,80,145);
    ctx.font=`${mobile?40:hasImage?27:32}px sans-serif`;lines.forEach((line,i)=>ctx.fillText(line,80,225+i*(mobile?70:57)));
    if(hasImage){
      const imageBox=workPage===0?{x:675,y:170,width:495,height:500}:workPage===2?{x:720,y:40,width:430,height:630}:{x:665,y:75,width:510,height:590};
      const imageScale=Math.min(imageBox.width/pageImage.width,imageBox.height/pageImage.height);
      const imageWidth=pageImage.width*imageScale,imageHeight=pageImage.height*imageScale;
      ctx.drawImage(pageImage,imageBox.x+(imageBox.width-imageWidth)/2,imageBox.y+(imageBox.height-imageHeight)/2,imageWidth,imageHeight);
    }
    ctx.fillStyle='#397eff';ctx.fillRect(60,686,1080*(workPage+1)/UPLIANCE_WORK.length,5);
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture;
  }),[workPage,activeFrames,size.width]);
  const workTexture=workTextures[sequence.page===workPage&&zoomComplete&&!reduced?sequence.frame:0]||workTextures[0];
  useEffect(()=>()=>workTextures.forEach(texture=>texture.dispose()),[workTextures]);
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
