import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { UPLIANCE_WORK } from './uplianceWork';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, BoxHelper, CanvasTexture, Group, MathUtils, Mesh, MeshStandardMaterial, Object3D, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const noRaycast=()=>{};
const LEDS=Array.from({length:56},(_,i)=>i*Math.PI*2/56);
export default function Upliance({ placement=DEFAULT_PROP_PLACEMENT.upliance, reduced=false, interactive=true, onHover=()=>{}, focused=false, workPage=0, onSelect=()=>{}, controlsRef }) {
  const {scene}=useLoader(GLTFLoader,'/models/upliance/interactive.glb');
  const display=useLoader(TextureLoader,'/images/upliance-display.svg');
  display.colorSpace=SRGBColorSpace;
  const {invalidate,gl,camera,size,scene:renderScene}=useThree();
  const projectedEdge=useMemo(()=>new Vector3(),[]);
  const [hovered,setHovered]=useState(false),[latched,setLatched]=useState(false);
  const panel=useRef(null);
  const workTexture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=740;
    const ctx=canvas.getContext('2d'),page=UPLIANCE_WORK[workPage];
    ctx.fillStyle='#eaf0e8';ctx.fillRect(0,0,1200,740);
    ctx.fillStyle='#214c69';ctx.font='24px monospace';ctx.fillText(page.subtitle,100,66);
    ctx.fillStyle='#102e43';ctx.font='bold 44px sans-serif';ctx.fillText(page.title,100,145);
    ctx.font='32px sans-serif';page.lines.forEach((line,i)=>ctx.fillText(line,100,225+i*57));
    ctx.fillStyle='#397eff';ctx.fillRect(60,686,1080*(workPage+1)/UPLIANCE_WORK.length,5);
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture;
  },[workPage]);
  useEffect(()=>()=>workTexture.dispose(),[workTexture]);
  const progress=useRef(0),screenMaterial=useRef(null),leds=useRef(null),spill=useRef(null),hitArea=useRef(null);
  const ledMaterial=useMemo(()=>new MeshStandardMaterial({color:'#b0d4ff',emissive:'#3878ff',emissiveIntensity:0,transparent:true,opacity:0,depthWrite:false}),[]);
  useEffect(()=>()=>ledMaterial.dispose(),[ledMaterial]);
  useLayoutEffect(()=>{const transform=new Object3D();LEDS.forEach((angle,i)=>{transform.position.set(Math.cos(angle)*9.95,0,Math.sin(angle)*9.95);transform.rotation.y=-angle;transform.updateMatrix();leds.current.setMatrixAt(i,transform.matrix);});leds.current.instanceMatrix.needsUpdate=true;invalidate();},[invalidate]);
  const active=focused||(interactive&&(hovered||latched));
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
  useEffect(()=>{
    if(!hovered||!interactive)return;
    const outline=new BoxHelper(hitArea.current,'#e8c595');
    outline.material.transparent=true;outline.material.opacity=.35;outline.raycast=noRaycast;renderScene.add(outline);invalidate();
    const id=hitArea.current.uuid;
    gl.domElement.dataset.cursorObject=id;
    gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change',{bubbles:true}));
    return ()=>{
      renderScene.remove(outline);outline.geometry.dispose();outline.material.dispose();invalidate();
      if(gl.domElement.dataset.cursorObject===id){delete gl.domElement.dataset.cursorObject;gl.domElement.dispatchEvent(new CustomEvent('cursor-object-change',{bubbles:true}));}
    };
  },[hovered,interactive,gl,renderScene,invalidate,placement]);
  useFrame((_,dt)=>{
    if(focused && panel.current && controlsRef?.current){
      panel.current.updateWorldMatrix(true,false);camera.updateMatrixWorld();
      const corners=[[-8.64,5.34],[8.64,5.34],[8.64,-5.34],[-8.64,-5.34]].map(([x,y])=>{
        projectedEdge.set(x,y,.03).applyMatrix4(panel.current.matrixWorld).project(camera);
        return `${(projectedEdge.x+1)*size.width/2}px ${(1-projectedEdge.y)*size.height/2}px`;
      });
      controlsRef.current.querySelector('[data-display-surface]').style.clipPath=`polygon(${corners.join(',')})`;
      Array.from(controlsRef.current.querySelectorAll('button')).forEach((button,index)=>{
        projectedEdge.set(index===0?-8.15:7.5,index===2?4.35:0,.03).applyMatrix4(panel.current.matrixWorld).project(camera);
        const x=(projectedEdge.x+1)*size.width/2;
        const y=(1-projectedEdge.y)*size.height/2;
        button.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
        button.style.visibility=projectedEdge.z<1?'visible':'hidden';
      });
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
        onClick={event=>{event.stopPropagation();if(event.delta>5)return;
          panel.current.updateWorldMatrix(true,false);
          const target=panel.current.getWorldPosition(new Vector3());
          const normal=new Vector3(0,0,1).transformDirection(panel.current.matrixWorld);
          const worldScale=panel.current.getWorldScale(new Vector3());
          onHover('');onSelect({target:target.toArray(),normal:normal.toArray(),width:17.28*worldScale.x,height:10.68*worldScale.y});
        }}>
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
