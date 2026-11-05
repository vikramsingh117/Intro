import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, DoubleSide, PlaneGeometry, SRGBColorSpace } from 'three';
import { drawNotebook } from './drawNotebook';
import { NOTEBOOK_PAGES } from './notebookPages';
import { deformTearingPage, visibleLeftPage } from './notebookPaper.mjs';

export const NOTEBOOK_TARGET = [-1.7, -1.4, .65];
export default function Notebook({ open, focused, page, reduced, onOpen, onPageChange, tornPages = [], canTear, onTear }) {
  const cover = useRef(null), sheet = useRef(null), turn = useRef(null);
  const coverMotion = useRef(null), wasFocused = useRef(false);
  const tearSheet = useRef(null), tearGesture = useRef(null), suppressClickUntil = useRef(0);
  const tearRemnant = useRef(null);
  const peelingGeometry = useMemo(() => new PlaneGeometry(1.1, 1.55, 16, 32), []);
  useEffect(() => () => peelingGeometry.dispose(), [peelingGeometry]);
  const [shownPage, setShownPage] = useState(page);
  const [flip, setFlip] = useState(null);
  const { invalidate, size } = useThree();
  useEffect(() => {
    const cancel = () => {
      const gesture = tearGesture.current;
      tearGesture.current = null;
      if (gesture?.target.hasPointerCapture(gesture.id)) gesture.target.releasePointerCapture(gesture.id);
      if (tearSheet.current) tearSheet.current.rotation.z = 0;
      deformTearingPage(peelingGeometry, 0);
      if (tearRemnant.current) tearRemnant.current.visible = false;
      invalidate();
    };
    window.addEventListener('blur', cancel);
    return () => { window.removeEventListener('blur', cancel); cancel(); };
  }, [page, focused, invalidate, peelingGeometry]);
  const tornEdge = useMemo(() => {
    const geometry = new PlaneGeometry(.07, 1.55, 1, 24);
    const positions = geometry.attributes.position;
    for (let i = 1; i < positions.count; i += 2) positions.setX(i, .035 + Math.sin(i * 7.3) * .018);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => tornEdge.dispose(), [tornEdge]);
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
  useEffect(() => {
    const from = cover.current?.rotation.z || 0;
    const revisiting = open && focused && !wasFocused.current && from > Math.PI - .05;
    wasFocused.current = focused;
    coverMotion.current = {
      from, to: open ? Math.PI : 0, elapsed: 0,
      // An already-open notebook lifts slightly and settles when approached again.
      lift: revisiting, duration: revisiting ? 1.1 : 1.45,
    };
    invalidate();
  }, [open, focused, reduced, invalidate]);
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
    const motion = coverMotion.current;
    if (!motion) return;
    motion.elapsed += Math.min(dt, .05);
    const progress = reduced ? 1 : Math.max(0, Math.min(1, (motion.elapsed - .15) / motion.duration));
    const ease = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
    cover.current.rotation.z = motion.lift
      ? Math.PI - Math.sin(ease * Math.PI) * .5
      : motion.from + (motion.to - motion.from) * ease;
    if (progress < 1) state.invalidate();
    else { cover.current.rotation.z = motion.to; coverMotion.current = null; }
  });
  const leftIndex = visibleLeftPage(flip && !flip.forward ? flip.to : shownPage, tornPages);
  const rightIndex = flip && flip.forward ? flip.to : shownPage;
  const tornFlip = flip && tornPages.includes(flip.forward ? flip.from : flip.to);
  const resetTear = event => {
    const gesture = tearGesture.current;
    if (!gesture || (event && event.pointerId !== gesture.id)) return;
    tearGesture.current = null;
    if (gesture.target.hasPointerCapture(gesture.id)) gesture.target.releasePointerCapture(gesture.id);
    if (tearSheet.current) tearSheet.current.rotation.z = 0;
    deformTearingPage(peelingGeometry, 0);
    if (tearRemnant.current) tearRemnant.current.visible = false;
    invalidate();
  };
  const startTear = event => {
    if (!focused || !canTear || tornPages.includes(shownPage) || turn.current || coverMotion.current || page !== shownPage || event.button !== 0 || tearGesture.current) return;
    event.stopPropagation();
    tearGesture.current = { id: event.pointerId, target: event.target, x: event.clientX, y: event.clientY, page: shownPage };
    event.target.setPointerCapture(event.pointerId);
  };
  const tearDistance = event => Math.hypot(event.clientX - tearGesture.current.x, event.clientY - tearGesture.current.y);
  const tearThreshold = Math.max(72, Math.min(size.width, size.height) * .18);
  const moveTear = event => {
    if (tearGesture.current?.id !== event.pointerId) return;
    event.stopPropagation();
    const progress = Math.min(1, tearDistance(event) / tearThreshold);
    deformTearingPage(peelingGeometry, progress);
    if (tearRemnant.current) tearRemnant.current.visible = progress > .02;
    invalidate();
  };
  const endTear = event => {
    if (tearGesture.current?.id !== event.pointerId) return;
    event.stopPropagation();
    const shouldTear = tearDistance(event) >= tearThreshold;
    const tornPage = tearGesture.current.page;
    if (tearDistance(event) > 5) suppressClickUntil.current = performance.now() + 500;
    resetTear(event);
    if (shouldTear) onTear(tornPage);
  };
  const selectPage = (event, direction) => {
    event.stopPropagation();
    if(event.delta>5 || performance.now() < suppressClickUntil.current) return;
    if(!focused) { onOpen(); return; }
    if(!turn.current && !coverMotion.current) onPageChange(Math.max(0, Math.min(NOTEBOOK_PAGES.length-1, shownPage+direction)));
  };
  return <group position={NOTEBOOK_TARGET} onClick={event=>{event.stopPropagation();if(event.delta<=5 && performance.now() >= suppressClickUntil.current)onOpen();}}>
    <mesh position={[.55,-.055,0]} castShadow receiveShadow><boxGeometry args={[1.16,.08,1.65]}/><meshStandardMaterial color="#354d43" roughness={.9}/></mesh>
    <mesh position={[.55,0,0]} receiveShadow><boxGeometry args={[1.08,.07,1.55]}/><meshStandardMaterial color="#ded1ae"/></mesh>
    {open && <>
      <group ref={tearSheet} position={[0,.045,0]} onPointerDown={startTear} onPointerMove={moveTear} onPointerUp={endTear} onPointerCancel={resetTear} onLostPointerCapture={resetTear}>
        <mesh geometry={peelingGeometry} userData={{precisePicking:true}} rotation={[-Math.PI/2,0,0]} position={[.55,0,0]} castShadow receiveShadow onClick={event=>selectPage(event,1)}><meshStandardMaterial map={tornPages.includes(rightIndex) ? null : textures[rightIndex].right} color={tornPages.includes(rightIndex) ? '#b9aa88' : '#ffffff'} roughness={.95} side={DoubleSide}/></mesh>
      </group>
      <mesh ref={tearRemnant} visible={false} geometry={tornEdge} rotation={[-Math.PI/2,0,0]} position={[.035,.048,0]}><meshStandardMaterial color="#eee3c8" roughness={1} side={DoubleSide}/></mesh>
      {tornPages.includes(rightIndex) && <mesh geometry={tornEdge} rotation={[-Math.PI/2,0,0]} position={[.035,.048,0]}><meshStandardMaterial color="#eee3c8" roughness={1}/></mesh>}
      {flip && <group ref={sheet} position={[0,.055,0]} rotation={[0,0,flip.forward ? 0 : Math.PI]}>
        {tornFlip ? <mesh geometry={tornEdge} position={[.035,0,0]} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><meshStandardMaterial color="#eee3c8" roughness={1} side={DoubleSide}/></mesh> : <>
        <mesh position={[.55,.002,0]} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><planeGeometry args={[1.1,1.55]}/><meshStandardMaterial map={textures[flip.forward ? flip.from : flip.to].right} roughness={.95}/></mesh>
        <mesh position={[.55,-.002,0]} rotation={[Math.PI/2,0,Math.PI]} castShadow receiveShadow><planeGeometry args={[1.1,1.55]}/><meshStandardMaterial map={textures[visibleLeftPage(flip.forward ? flip.to : flip.from, tornPages)].left} roughness={.95}/></mesh>
        </>}
      </group>}
    </>}
    <group ref={cover}>
      <mesh position={[.55,.055,0]} castShadow receiveShadow><boxGeometry args={[1.16,.035,1.65]}/><meshStandardMaterial color="#405c4c" roughness={.85}/></mesh>
      {/* The inside page travels with the cover and is concealed while closed. */}
      <mesh position={[.55,.036,0]} rotation={[Math.PI/2,0,Math.PI]} receiveShadow onClick={event=>selectPage(event,-1)}><planeGeometry args={[1.1,1.55]}/><meshStandardMaterial map={textures[leftIndex].left} roughness={.95}/></mesh>
      <mesh position={[.55,.076,-.12]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.65,.36]}/><meshStandardMaterial color="#c7b58a" roughness={.9}/></mesh>
    </group>
    <mesh position={[1.4,-.035,.08]} rotation={[Math.PI/2,0,-.12]} castShadow><cylinderGeometry args={[.025,.025,1.35,8]}/><meshStandardMaterial color="#263e3e" metalness={.3} roughness={.5}/></mesh>
  </group>;
}
