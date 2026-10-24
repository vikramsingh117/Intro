import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { NOTEBOOK_PAGES } from './notebookPages';

export const NOTEBOOK_TARGET = [-1.7, -1.4, .65];
export default function Notebook({ open, focused, page, reduced, onOpen, onPageChange }) {
  const cover = useRef(null), sheet = useRef(null), turn = useRef(null);
  const [shownPage, setShownPage] = useState(page);
  const [flip, setFlip] = useState(null);
  const { invalidate } = useThree();
  const textures = useMemo(() => NOTEBOOK_PAGES.map((entry, page) => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 840;
    const c = canvas.getContext('2d');
    c.fillStyle = '#eee1bf'; c.fillRect(0, 0, 1200, 840);
    c.strokeStyle = '#b3b4a84d'; c.lineWidth = 1;
    for (let y = 110; y < 820; y += 38) { c.beginPath(); c.moveTo(35, y); c.lineTo(1165, y); c.stroke(); }
    c.fillStyle = '#544b3b'; c.font = '18px monospace'; c.fillText('VIKRAM / FIELD NOTES', 40, 55);
    c.font = 'italic 36px Georgia';
    const wrap = (text, x, y, width, line) => {
      let row = ''; for (const word of text.split(' ')) {
        if (c.measureText(row + word).width > width && row) { c.fillText(row.trim(), x, y); y += line; row = ''; }
        row += word + ' ';
      } c.fillText(row.trim(), x, y); return y + line;
    };
    let y = wrap(entry.title, 40, 118, 495, 45);
    c.font = '24px Georgia'; y = wrap(entry.text, 40, y + 35, 490, 35);
    c.fillStyle = '#9a5e43'; c.font = 'italic 28px Georgia'; wrap(entry.question, 40, y + 45, 485, 39);
    c.save(); c.scale(1, .6);
    c.strokeStyle = '#5b7470'; c.fillStyle = '#405c58'; c.lineWidth = 4;
    const box = (x, y, w, h, label) => { c.strokeRect(x, y, w, h); c.font = '22px monospace'; c.fillText(label, x + 12, y + 34); };
    const arrow = (x, y, xx, yy) => { c.beginPath(); c.moveTo(x,y); c.lineTo(xx,yy); c.lineTo(xx-10,yy-10); c.moveTo(xx,yy); c.lineTo(xx-10,yy+10); c.stroke(); };
    if (entry.doodle === 'loop') {
      box(650,160,190,95,'understand'); box(910,160,190,95,'decide');
      box(650,370,190,95,'observe'); box(910,370,190,95,'build');
      arrow(845,205,900,205); arrow(1005,265,1005,355); arrow(900,415,850,415); arrow(745,355,745,265);
      c.font='italic 30px Georgia'; c.fillText('people in the loop',700,570);
    } else if (entry.doodle === 'recipe') {
      box(690,170,340,330,'recipe / selected device');
      c.beginPath(); c.ellipse(860,310,95,45,0,0,Math.PI*2); c.stroke();
      c.font='25px Georgia'; c.fillText('✓ diet   ✓ allergens',720,440);
      c.beginPath(); c.moveTo(975,170); c.lineTo(975,260); c.lineTo(995,240); c.lineTo(1015,260); c.lineTo(1015,170); c.stroke();
      c.font='italic 28px Georgia'; c.fillText('keep my place ↩',735,580);
    } else {
      box(650,155,440,115,'chat → recipe result');
      c.beginPath(); c.moveTo(670,470); c.lineTo(670,315); c.moveTo(670,470); c.lineTo(1090,470); c.moveTo(690,420); c.lineTo(770,400); c.lineTo(840,440); c.lineTo(930,350); c.lineTo(1060,380); c.stroke();
      c.font='22px monospace'; c.fillText('timing / illustrative',700,510);
      box(680,590,145,80,'docs'); arrow(840,630,915,630); box(930,590,160,80,'synced');
    }
    c.restore();
    c.fillStyle = '#405c58'; c.font = '22px Georgia';
    let noteY = 465;
    entry.notes.forEach(note => { noteY = wrap('• ' + note, 645, noteY, 495, 29) + 14; });
    c.fillStyle='#bba981'; c.fillRect(592,0,16,840);
    c.fillStyle='#756c59'; c.font='18px monospace'; c.fillText(String(page*2+1).padStart(2,'0'),45,800); c.fillText(String(page*2+2).padStart(2,'0'),1110,800);
    c.font='20px Georgia'; if(page>0)c.fillText('←',90,800); if(page<NOTEBOOK_PAGES.length-1)c.fillText('→',1060,800);
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
