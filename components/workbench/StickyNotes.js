import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, DoubleSide, Plane, SRGBColorSpace, Vector3 } from 'three';
import InteractiveObject from './InteractiveObject';

const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
function useNoteTexture(text) {
  const texture = useMemo(() => {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
    const c=canvas.getContext('2d');
    c.fillStyle='#efd67f';c.fillRect(0,0,512,512);
    c.fillStyle='#d3b45b';c.fillRect(0,0,512,46);
    c.fillStyle='#403c31';c.font='28px "Chalkboard SE", "Comic Sans MS", sans-serif';
    let row='',y=95;
    for(const character of text){
      if(y>440){row='…';y=464;break;}
      if(character==='\n' || c.measureText(row+character).width>436){c.fillText(row,38,y);y+=36;row='';}
      if(character!=='\n')row+=character;
    }
    c.fillText(row,38,y);
    const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;return map;
  },[text]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return texture;
}
function WallNote({ note, api, onHover }) {
  const { invalidate } = useThree();
  const drag = useRef(null);
  const mesh = useRef(null);
  const texture = useNoteTexture(note.text);
  const wall = useMemo(()=>new Plane(new Vector3(0,0,1),3.075),[]);
  const point = useMemo(()=>new Vector3(),[]);
  return <InteractiveObject label={note.canEdit ? "Your note · drag to move, tap to edit" : "Visitor note · tap to read"} onHover={onHover}>
    <mesh ref={mesh} position={[note.x,note.y,-3.075]}
      onPointerDown={event=>{
        if(api.placing || api.busy || event.button!==0)return;
        event.stopPropagation();
        if(!event.ray.intersectPlane(wall,point))return;
        drag.current={id:event.pointerId,dx:note.x-point.x,dy:note.y-point.y,x:event.clientX,y:event.clientY,moved:false};
        api.setDragging(true);event.target.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event=>{
        const gesture=drag.current;if(!gesture || event.pointerId!==gesture.id)return;
        event.stopPropagation();
        if(Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>5)gesture.moved=true;
        if(note.canEdit && gesture.moved && event.ray.intersectPlane(wall,point)){
          mesh.current.position.set(clamp(point.x+gesture.dx,-2.25,6),clamp(point.y+gesture.dy,.9,4.7),-3.075);
          invalidate();
        }
      }}
      onPointerUp={event=>{
        const gesture=drag.current;if(!gesture)return;event.stopPropagation();
        if(gesture.moved && note.canEdit){
          const {x,y}=mesh.current.position;
          mesh.current.position.set(note.x,note.y,-3.075);invalidate();
          api.move(note.id,x,y);
        } else if(!gesture.moved)api.edit(note);
        drag.current=null;api.setDragging(false);event.target.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={event=>{drag.current=null;api.setDragging(false);mesh.current.position.set(note.x,note.y,-3.075);event.target.releasePointerCapture(event.pointerId);}}
      onClick={event=>event.stopPropagation()}>
      <planeGeometry args={[.72,.72]}/><meshStandardMaterial map={texture} roughness={.95} polygonOffset polygonOffsetFactor={-1}/>
    </mesh>
  </InteractiveObject>;
}
function FlyingNote({ api, reduced }) {
  const mesh=useRef(null), motion=useRef({elapsed:0,target:new Vector3(1.8,2.8,-2.6),paste:null});
  const {invalidate}=useThree();
  const texture=useNoteTexture(api.placing.text);
  const placeRef=useRef(api.place);placeRef.current=api.place;
  useEffect(()=>{invalidate();},[invalidate]);
  useEffect(()=>{if(api.error){motion.current.paste=null;motion.current.target.z=-2.6;invalidate();}},[api.error,invalidate]);
  useFrame((state,delta)=>{
    if(!mesh.current)return;
    const m=motion.current;m.elapsed+=Math.min(delta,.05);
    const t=reduced?1:Math.min(1,m.elapsed/1.5);
    if(t<.43){
      const lift=t/.43;
      mesh.current.position.set(3.7,-1.397+lift*.8,.8+lift*.25);
      mesh.current.rotation.set(-Math.PI/2+lift*.5,0,-lift*.13);
    }else if(t<1){
      const travel=(t-.43)/.57,ease=travel*travel*(3-2*travel);
      mesh.current.position.lerpVectors(new Vector3(3.7,-.597,1.05),m.target,ease);
      mesh.current.rotation.set((-Math.PI/2+.5)*(1-ease),0,-.13*(1-ease));
    }else if(m.paste){
      m.paste.elapsed+=Math.min(delta,.05);
      const p=reduced?1:Math.min(1,m.paste.elapsed/.5),ease=p*p*(3-2*p);
      mesh.current.position.lerpVectors(m.paste.from,m.paste.to,ease);
      mesh.current.rotation.set(0,0,Math.sin(p*Math.PI)*.06);
      if(p===1 && !m.paste.sent){m.paste.sent=true;placeRef.current(m.paste.to.x,m.paste.to.y);}
    }else{mesh.current.position.lerp(m.target,reduced?1:.2);mesh.current.rotation.set(0,0,0);}
    const positions=mesh.current.geometry.attributes.position;
    for(let i=0;i<positions.count;i++)positions.setZ(i,Math.sin((positions.getY(i)+.36)/.72*Math.PI)*.085*(1-t));
    positions.needsUpdate=true;
    if(t<1 || (m.paste&&!m.paste.sent) || mesh.current.position.distanceTo(m.target)>.002 && !m.paste)state.invalidate();
  });
  const target=event=>new Vector3(clamp(event.point.x,-2.25,6),clamp(event.point.y,.9,4.7),-2.6);
  return <>
    <mesh ref={mesh} position={[3.7,-1.397,.8]} rotation={[-Math.PI/2,0,0]} raycast={()=>null}>
      <planeGeometry args={[.72,.72,12,12]}/><meshStandardMaterial map={texture} side={DoubleSide} roughness={.95}/>
    </mesh>
    <mesh position={[1.875,2.8,-3.06]} onPointerMove={event=>{event.stopPropagation();if(!motion.current.paste){motion.current.target.copy(target(event));invalidate();}}}
      onClick={event=>{
        event.stopPropagation();const m=motion.current;
        if(event.delta>5 || api.busy || m.paste || (!reduced&&m.elapsed<1.5))return;
        const to=target(event);to.z=-3.07;m.paste={elapsed:0,from:mesh.current.position.clone(),to,sent:false};invalidate();
      }}>
      <planeGeometry args={[8.97,4.52]}/><meshBasicMaterial color="#e8cc78" transparent opacity={.1} depthWrite={false}/>
    </mesh>
  </>;
}
export default function StickyNotes({ api, onHover, reduced }) {
  return <group>
    <InteractiveObject label="Sticky notes · leave a message" onHover={onHover}>
      <group position={[3.7,-1.45,.8]} rotation={[0,0,0]} onClick={event=>{event.stopPropagation();if(event.delta<=5)api.edit();}}>
        <mesh castShadow><boxGeometry args={[.72,.1,.72]}/><meshStandardMaterial color="#efd67f" roughness={.95}/></mesh>
        <mesh position={[0,.052,-.22]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.72,.15]}/><meshStandardMaterial color="#d9ba61"/></mesh>
      </group>
    </InteractiveObject>
    {api.notes.map(note=><WallNote key={note.id} note={note} api={api} onHover={onHover}/>)}
    {api.placing && <FlyingNote key={api.placing.id} api={api} reduced={reduced}/>}
  </group>;
}
