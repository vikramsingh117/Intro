// Renders the 2025 ceiling projector and its matching draggable wall-sized portfolio projection.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferGeometry, CanvasTexture, DoubleSide, Float32BufferAttribute, NearestFilter, Quaternion, SRGBColorSpace, Vector3 } from 'three';
import InteractiveObject from './InteractiveObject';
import { CENTERED_PROJECTOR, resistedPull } from './projectorMotion.mjs';
import { drawWorkBoardIcon, WORK_BOARD_TILES, workBoardTileIndex } from './workBoardTiles.mjs';
import { contributions } from '../../lib/contributions';
export const WORK_BOARD_TARGET=[1.5,2.35,-3.07];
const PROJECTOR_POSITION=[1.5,5.1,1.25];
const CEILING_Y=24.02;

function createBoardTexture(selected,detailTile) {
  const canvas=document.createElement('canvas');
  canvas.width=768;canvas.height=576;
  const context=canvas.getContext('2d');
  context.fillStyle='#182a24';context.fillRect(0,0,768,576);
  const vignette=context.createRadialGradient(384,270,80,384,270,470);
  vignette.addColorStop(0,'#344d3f');vignette.addColorStop(1,'#101c18');
  context.fillStyle=vignette;context.fillRect(0,0,768,576);
  if(detailTile==='github'){
    const github=WORK_BOARD_TILES[0];
    drawWorkBoardIcon(context,github,48,34,74);
    context.fillStyle='#d8c58e';context.font='bold 42px monospace';context.fillText('GITHUB / OPEN SOURCE',146,72);
    context.fillStyle='#819687';context.font='18px monospace';context.fillText('SELECTED CONTRIBUTIONS · SAVED STATUS',148,99);
    contributions.forEach((item,index)=>{
      const y=130+index*126;
      context.fillStyle='#0e1814';context.fillRect(48,y+8,672,102);
      context.fillStyle=index%2?'#b9c8ae':'#d9d7c6';context.fillRect(40,y,672,102);
      context.fillStyle='#20302a';context.font='bold 25px monospace';context.fillText(item.project.toUpperCase(),62,y+36);
      context.font='17px monospace';context.fillText(item.title.toUpperCase().slice(0,58),62,y+67);
      context.fillStyle=item.status==='Merged'?'#426c55':'#9a713c';context.fillRect(570,y+24,116,38);
      context.fillStyle='#fff4cf';context.font='bold 17px monospace';context.fillText(item.status.toUpperCase(),590,y+49);
    });
    context.fillStyle='#819687';context.font='16px monospace';context.fillText('STATUSES ARE SAVED SNAPSHOTS · NOT LIVE GITHUB DATA',48,536);
  }else if(detailTile==='leetcode'){
    const leetcode=WORK_BOARD_TILES[1];
    drawWorkBoardIcon(context,leetcode,48,30,76);
    context.fillStyle='#d8c58e';context.font='bold 40px monospace';context.fillText('LEETCODE / SNAPSHOT',148,70);
    context.fillStyle='#819687';context.font='18px monospace';context.fillText('VIKRAMANDANSHU · SAVED PROFILE METRICS',148,98);
    const stats=[['SOLVED','534 / 4,110'],['CONTEST RATING','1,471'],['PROFILE RANK','190,208'],['TOP','54.42%']];
    stats.forEach(([label,value],index)=>{
      const x=42+(index%2)*350,y=130+Math.floor(index/2)*112;
      context.fillStyle='#20382e';context.fillRect(x,y,326,92);
      context.fillStyle='#8da291';context.font='16px monospace';context.fillText(label,x+20,y+28);
      context.fillStyle='#f1e8c9';context.font='bold 31px monospace';context.fillText(value,x+20,y+68);
    });
    const difficulties=[['EASY',222,975,'#34b8ab'],['MEDIUM',298,2146,'#e8b443'],['HARD',14,989,'#df6563']];
    difficulties.forEach(([label,solved,total,color],index)=>{
      const y=374+index*48;
      context.fillStyle=color;context.font='bold 17px monospace';context.fillText(label,48,y+18);
      context.fillStyle='#16251f';context.fillRect(154,y,460,18);
      context.fillStyle=color;context.fillRect(154,y,Math.max(8,460*solved/534),18);
      context.fillStyle='#d9dccd';context.font='16px monospace';context.fillText(`${solved} / ${total}`,630,y+17);
    });
    context.fillStyle='#819687';context.font='15px monospace';context.fillText('3 CONTESTS · 52 ACTIVE DAYS · 11 MAX STREAK · 5 BADGES',48,546);
  }else{
    context.fillStyle='#17261fcc';context.fillRect(28,24,712,76);
    context.fillStyle='#d8c58e';context.font='bold 38px monospace';context.fillText('WORK / BUILD',54,73);
    context.fillStyle='#819687';context.font='18px monospace';context.fillText('2025  ·  PROJECTS AND EXPERIENCE',54,94);
    WORK_BOARD_TILES.forEach((card,index)=>{
    const column=index%2,row=Math.floor(index/2),x=48+column*352,y=126+row*176;
    context.fillStyle='#0f1915';context.fillRect(x+8,y+10,304,142);
    context.fillStyle=card.color;context.fillRect(x,y,304,142);
    drawWorkBoardIcon(context,card,x+22,y+22,62);
    context.fillStyle=card.ink;context.font='bold 24px monospace';context.fillText(card.title,x+102,y+49);
    context.font='17px monospace';context.fillText(card.detail,x+102,y+78);
    context.fillStyle=card.ink+'99';context.fillRect(x+24,y+102,252,8);context.fillRect(x+24,y+120,180,6);
    context.fillStyle='#f0d58f';context.beginPath();context.arc(x+282,y+20,7,0,Math.PI*2);context.fill();
    if(index===selected){context.strokeStyle='#fff0ae';context.lineWidth=8;context.strokeRect(x+4,y+4,296,134);}
    });
    context.fillStyle='#d8c58e';context.font='20px monospace';
    context.fillText(selected==null?'CLICK A TILE TO EXPLORE  →':WORK_BOARD_TILES[selected].summary,selected==null?430:48,548);
  }
  context.fillStyle='#d8c58e10';
  for(let y=0;y<576;y+=6)context.fillRect(0,y,768,2);
  context.strokeStyle='#d8c58e55';context.lineWidth=3;context.strokeRect(12,12,744,552);
  const texture=new CanvasTexture(canvas);
  texture.colorSpace=SRGBColorSpace;
  texture.minFilter=NearestFilter;texture.magFilter=NearestFilter;
  return texture;
}

function createBackTexture() {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=80;
  const context=canvas.getContext('2d');context.fillStyle='#182a24';context.fillRect(0,0,512,80);
  context.strokeStyle='#d8c58e';context.lineWidth=4;context.strokeRect(3,3,506,74);
  context.fillStyle='#f0e4bd';context.font='bold 24px monospace';context.textAlign='center';context.fillText('← BACK TO WORK / BUILD',256,50);
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.minFilter=NearestFilter;texture.magFilter=NearestFilter;return texture;
}

export default function WorkBuildBoard({ focused, keyboardFocused, registerRoomAction, onSelect, onTileSelect, selectedTile, onHover, onDragging, projectorState=CENTERED_PROJECTOR, onProjectorChange }) {
  const [selectedCard,setSelectedCard]=useState(null);
  const [detailTile,setDetailTile]=useState(null);
  const selectedIndex=selectedTile ? workBoardTileIndex(selectedTile) : selectedCard;
  const texture=useMemo(()=>createBoardTexture(selectedIndex,detailTile),[selectedIndex,detailTile]);
  const backTexture=useMemo(()=>createBackTexture(),[]);
  const powered=projectorState.powered,pull=projectorState.pull||CENTERED_PROJECTOR.pull;
  const offset=useMemo(()=>({x:pull.x*2.4,y:pull.y*1.35}),[pull.x,pull.y]);
  const drag=useRef(null),dragged=useRef(false);
  const swing=useRef(null),flickerUntil=useRef(0);
  const projectionMaterial=useRef(null),beamMaterial=useRef(null),lensMaterial=useRef(null),lensLight=useRef(null);
  const size=useThree(state=>state.size);
  const projectorPosition=useMemo(()=>[
    PROJECTOR_POSITION[0]+offset.x,
    PROJECTOR_POSITION[1]+offset.y,
    PROJECTOR_POSITION[2],
  ],[offset]);
  const projectionPosition=useMemo(()=>[
    WORK_BOARD_TARGET[0]+offset.x*1.18,
    WORK_BOARD_TARGET[1]+offset.y*.82,
    WORK_BOARD_TARGET[2],
  ],[offset]);
  const beam=useMemo(()=>{
    const lens=new Vector3(...projectorPosition).add(new Vector3(0,.02,-.43));
    const [x,y,z]=projectionPosition,halfWidth=2.6,halfHeight=1.575;
    const corners=[
      new Vector3(x-halfWidth,y+halfHeight,z+.04),new Vector3(x+halfWidth,y+halfHeight,z+.04),
      new Vector3(x+halfWidth,y-halfHeight,z+.04),new Vector3(x-halfWidth,y-halfHeight,z+.04),
    ];
    const faces=[];
    for(let index=0;index<4;index++)faces.push(...lens.toArray(),...corners[index].toArray(),...corners[(index+1)%4].toArray());
    const rays=[];
    corners.forEach(corner=>rays.push(...lens.toArray(),...corner.toArray()));
    const volume=new BufferGeometry();volume.setAttribute('position',new Float32BufferAttribute(faces,3));
    const edges=new BufferGeometry();edges.setAttribute('position',new Float32BufferAttribute(rays,3));
    return {volume,edges,lens};
  },[projectorPosition,projectionPosition]);
  const wire=useMemo(()=>{
    const anchor=new Vector3(PROJECTOR_POSITION[0],CEILING_Y,PROJECTOR_POSITION[2]+.08);
    const projector=new Vector3(projectorPosition[0],projectorPosition[1],projectorPosition[2]+.08);
    const direction=projector.clone().sub(anchor),length=direction.length();
    return {
      midpoint:anchor.clone().add(projector).multiplyScalar(.5),
      quaternion:new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction.normalize()),
      length,
    };
  },[projectorPosition]);
  const invalidate=useThree(state=>state.invalidate);
  useEffect(()=>{invalidate();return()=>texture.dispose();},[invalidate,texture]);
  useEffect(()=>()=>backTexture.dispose(),[backTexture]);
  useEffect(()=>{if(!focused)setDetailTile(null);},[focused]);
  useEffect(()=>setDetailTile(null),[selectedTile]);
  useEffect(()=>()=>{beam.volume.dispose();beam.edges.dispose();},[beam]);
  useEffect(()=>registerRoomAction?.('work-board',onSelect),[registerRoomAction,onSelect]);
  useEffect(()=>{
    let timer;
    const flicker=()=>{
      const activeFlicker=performance.now()<flickerUntil.current;
      const level=activeFlicker ? .58+Math.random()*.4 : Math.random()<.08 ? .72+Math.random()*.15 : .94+Math.random()*.06;
      if(projectionMaterial.current){projectionMaterial.current.emissiveIntensity=.72*level;projectionMaterial.current.opacity=.96*level;}
      if(beamMaterial.current)beamMaterial.current.opacity=.052*level;
      if(lensMaterial.current)lensMaterial.current.emissiveIntensity=5.5*level;
      if(lensLight.current)lensLight.current.intensity=9*level;
      invalidate();
      timer=window.setTimeout(flicker,activeFlicker?45+Math.random()*55:80+Math.random()*210);
    };
    if(powered)flicker();
    else invalidate();
    return()=>window.clearTimeout(timer);
  },[powered,invalidate]);
  const inspect=event=>{event?.stopPropagation();if(!event||event.delta<=5)onSelect?.();};
  const selectTile=(event,index)=>{
    event.stopPropagation();
    if(event.delta>5)return;
    if(!focused){onSelect?.();return;}
    setSelectedCard(index);
    const id=WORK_BOARD_TILES[index].id;
    if(id==='github'||id==='leetcode')setDetailTile(id);
    else onTileSelect?.(id);
  };
  const showBoard=event=>{event.stopPropagation();if(event.delta<=5)setDetailTile(null);};
  const togglePower=event=>{
    event?.stopPropagation();
    if(dragged.current){dragged.current=false;return;}
    if(!event||event.delta<=5)onProjectorChange?.(current=>({...current,powered:!current.powered}));
  };
  const startDrag=event=>{
    event.stopPropagation();
    dragged.current=false;
    swing.current=null;
    flickerUntil.current=performance.now()+500;
    onDragging?.(true);
    drag.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,pull:{...pull}};
    event.target.setPointerCapture?.(event.pointerId);
  };
  const moveDrag=event=>{
    if(!drag.current||drag.current.pointerId!==event.pointerId)return;
    event.stopPropagation();
    const dx=event.clientX-drag.current.x,dy=event.clientY-drag.current.y;
    if(Math.hypot(dx,dy)>4)dragged.current=true;
    flickerUntil.current=performance.now()+500;
    const nextPull={
      x:resistedPull(drag.current.pull.x,dx/Math.max(1,size.width)*3.2),
      y:resistedPull(drag.current.pull.y,-dy/Math.max(1,size.height)*3),
    };
    onProjectorChange?.(current=>({...current,pull:nextPull}));
    invalidate();
  };
  const endDrag=event=>{
    if(!drag.current||drag.current.pointerId!==event.pointerId)return;
    event.stopPropagation();
    event.target.releasePointerCapture?.(event.pointerId);
    drag.current=null;
    swing.current={from:{...pull},elapsed:0,duration:1.15};
    flickerUntil.current=performance.now()+500;
    onDragging?.(false);
    invalidate();
  };
  useEffect(()=>()=>onDragging?.(false),[onDragging]);
  useFrame((state,dt)=>{
    const motion=swing.current;
    if(!motion)return;
    motion.elapsed+=Math.min(dt,.05);
    const progress=Math.min(1,motion.elapsed/motion.duration),envelope=(1-progress)**2;
    const oscillation=Math.cos(progress*Math.PI*4.5);
    const nextPull={x:motion.from.x*envelope*oscillation,y:motion.from.y*envelope*oscillation};
    onProjectorChange?.(current=>({...current,pull:nextPull}));
    if(progress>=1){swing.current=null;onProjectorChange?.(current=>({...current,pull:{x:0,y:0}}));}
    else state.invalidate();
  });
  return <group>
    {powered && <>
      <InteractiveObject moving focused={focused||keyboardFocused} label="Work / Build projection · inspect" onHover={onHover} onFocus={onSelect}>
      <mesh position={projectionPosition} onClick={inspect}>
        <planeGeometry args={[5.2,3.15]}/>
        <meshStandardMaterial ref={projectionMaterial} map={texture} emissive="#b9d6b9" emissiveMap={texture} emissiveIntensity={.7} transparent opacity={.96} roughness={.9}/>
      </mesh>
      {!detailTile&&WORK_BOARD_TILES.map((tile,index)=><mesh key={tile.id} position={[projectionPosition[0]+tile.worldOffset[0],projectionPosition[1]+tile.worldOffset[1],projectionPosition[2]+.015]} onClick={event=>selectTile(event,index)}>
        <planeGeometry args={[2.05,.78]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
      </mesh>)}
      {detailTile&&<mesh position={[projectionPosition[0],projectionPosition[1]-1.82,projectionPosition[2]+.02]} onClick={showBoard}>
        <planeGeometry args={[2.55,.4]}/><meshBasicMaterial map={backTexture} transparent toneMapped={false}/>
      </mesh>}
      </InteractiveObject>
      <mesh geometry={beam.volume} renderOrder={1}>
        <meshBasicMaterial ref={beamMaterial} color="#d7e4bd" transparent opacity={.052} depthWrite={false} side={DoubleSide} blending={AdditiveBlending}/>
      </mesh>
      <lineSegments geometry={beam.edges} renderOrder={2}>
        <lineBasicMaterial color="#f0ebc5" transparent opacity={.12} depthWrite={false} blending={AdditiveBlending}/>
      </lineSegments>
      <pointLight ref={lensLight} position={beam.lens} color="#e9e6b8" intensity={9} distance={5.5} decay={2}/>
    </>}
    <mesh position={wire.midpoint} quaternion={wire.quaternion}>
      <cylinderGeometry args={[.038,.038,wire.length,10]}/><meshStandardMaterial color="#303a34" roughness={.8}/>
    </mesh>
    <mesh position={[PROJECTOR_POSITION[0],CEILING_Y-.04,PROJECTOR_POSITION[2]+.08]}>
      <cylinderGeometry args={[.25,.25,.08,20]}/><meshStandardMaterial color="#515d54" roughness={.68}/>
    </mesh>
    <InteractiveObject moving label={powered?'Projector · drag or turn off':'Projector · drag or turn on'} onHover={onHover}>
      <group position={projectorPosition} rotation={[-.08,0,0]} onClick={togglePower} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <mesh><boxGeometry args={[1.02,.28,.72]}/><meshStandardMaterial color="#4f5a50" roughness={.72}/></mesh>
        <mesh position={[0,.16,.04]}><boxGeometry args={[.82,.08,.52]}/><meshStandardMaterial color="#718071" roughness={.65}/></mesh>
        <mesh position={[0,.03,-.38]} rotation={[Math.PI/2,0,0]}>
          <cylinderGeometry args={[.13,.13,.08,24]}/><meshStandardMaterial color="#18221e" roughness={.25}/>
        </mesh>
        <mesh position={[0,.03,-.425]} rotation={[Math.PI/2,0,0]}>
          <circleGeometry args={[.085,24]}/><meshStandardMaterial ref={lensMaterial} color={powered?'#e7d99e':'#4b4b42'} emissive={powered?'#fff1aa':'#000000'} emissiveIntensity={powered?5.5:0} toneMapped={false} roughness={.15}/>
        </mesh>
        <mesh position={[.39,.18,.06]}><sphereGeometry args={[.028,10,8]}/><meshStandardMaterial color={powered?'#b7d99d':'#6a493f'} emissive={powered?'#8fc77d':'#35120d'} emissiveIntensity={powered?1.4:.25}/></mesh>
        <mesh position={[0,-.18,.08]}><boxGeometry args={[.62,.08,.42]}/><meshStandardMaterial color="#2f3932" roughness={.8}/></mesh>
      </group>
    </InteractiveObject>
  </group>;
}
