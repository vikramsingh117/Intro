import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { drawNotebook } from './drawNotebook';
import { NOTEBOOK_PAGES } from './notebookPages';

export const NOTEBOOK_TARGET = [-1.7, -1.4, .65];
export default function Notebook({ open, focused, page, reduced, onOpen, onPageChange }) {
  const cover = useRef(null), sheet = useRef(null), turn = useRef(null);
  const [shownPage, setShownPage] = useState(page);
  const [flip, setFlip] = useState(null);
  const { invalidate } = useThree();
  const textures = useMemo(() => NOTEBOOK_PAGES.map((entry, page) => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 840;
    drawNotebook(canvas, entry, page);
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; map.anisotropy = 8;
    const left = map.clone(), right = map.clone();
    left.repeat.x = right.repeat.x = .5; right.offset.x = .5;
    return { map, left, right };
  }), []);
  useEffect(() => () => textures.forEach(({map,left,right}) => {map.dispose();left.dispose();right.dispose();}), [textures]);
  useEffect(() => {
    if(page === shownPage) return;
    if(reduced || !open) { setShownPage(page); setFlip(null); turn.current=null; return; }
    const next = { from:shownPage, to:page, forward:page>shownPage, elapsed:0 };
    turn.current=next; setFlip(next); invalidate();
  }, [page, shownPage, reduced, open, invalidate]);
  useEffect(() => { invalidate(); }, [open, reduced, flip, invalidate]);
  useFrame((state, dt) => {
    if (turn.current && sheet.current) {
      const t = turn.current; t.elapsed += Math.min(dt,.05);
      const progress = Math.min(1,t.elapsed/.8);
      const eased = progress*progress*(3-2*progress);
      sheet.current.rotation.z = Math.PI*(t.forward ? eased : 1-eased);
      if(progress===1) { turn.current=null; setShownPage(t.to); setFlip(null); }
      else state.invalidate();
    }
    if (!cover.current) return;
    const goal = open ? Math.PI : 0;
    cover.current.rotation.z = reduced ? goal : cover.current.rotation.z + (goal-cover.current.rotation.z)*Math.min(1,dt*7);
    if (Math.abs(goal-cover.current.rotation.z) > .001) state.invalidate();
    else cover.current.rotation.z = goal;
  });
  const leftIndex = flip && !flip.forward ? flip.to : shownPage;
  const rightIndex = flip && flip.forward ? flip.to : shownPage;
  const selectPage = (event, direction) => {
    event.stopPropagation();
    if(event.delta>5) return;
    if(!focused) { onOpen(); return; }
    if(!turn.current) onPageChange(Math.max(0, Math.min(NOTEBOOK_PAGES.length-1, shownPage+direction)));
  };
  return <group position={NOTEBOOK_TARGET} onClick={event=>{event.stopPropagation();if(event.delta<=5)onOpen();}}>
    <mesh position={[.55,-.055,0]} castShadow receiveShadow><boxGeometry args={[1.16,.08,1.65]}/><meshStandardMaterial color="#354d43" roughness={.9}/></mesh>
    <mesh position={[.55,0,0]} receiveShadow><boxGeometry args={[1.08,.07,1.55]}/><meshStandardMaterial color="#ded1ae"/></mesh>
    {open && <>
      <mesh rotation={[-Math.PI/2,0,0]} position={[-.55,.045,0]} receiveShadow onClick={event=>selectPage(event,-1)}><planeGeometry args={[1.1,1.55]}/><meshStandardMaterial map={textures[leftIndex].left} roughness={.95}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[.55,.045,0]} receiveShadow onClick={event=>selectPage(event,1)}><planeGeometry args={[1.1,1.55]}/><meshStandardMaterial map={textures[rightIndex].right} roughness={.95}/></mesh>
      {flip && <group ref={sheet} position={[0,.055,0]} rotation={[0,0,flip.forward ? 0 : Math.PI]}>
        <mesh position={[.55,.002,0]} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><planeGeometry args={[1.1,1.55]}/><meshStandardMaterial map={textures[flip.forward ? flip.from : flip.to].right} roughness={.95}/></mesh>
        <mesh position={[.55,-.002,0]} rotation={[Math.PI/2,0,Math.PI]} castShadow receiveShadow><planeGeometry args={[1.1,1.55]}/><meshStandardMaterial map={textures[flip.forward ? flip.to : flip.from].left} roughness={.95}/></mesh>
      </group>}
    </>}
    <group ref={cover}>
      <mesh position={[.55,.055,0]} castShadow receiveShadow><boxGeometry args={[1.16,.035,1.65]}/><meshStandardMaterial color="#405c4c" roughness={.85}/></mesh>
      <mesh position={[.55,.076,-.12]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.65,.36]}/><meshStandardMaterial color="#c7b58a" roughness={.9}/></mesh>
    </group>
    <mesh position={[1.4,-.035,.08]} rotation={[Math.PI/2,0,-.12]} castShadow><cylinderGeometry args={[.025,.025,1.35,8]}/><meshStandardMaterial color="#263e3e" metalness={.3} roughness={.5}/></mesh>
  </group>;
}
