// Assembles independently placeable SVG items into each About Me year scene.
// The shared layout manifest drives both artwork transforms and interactive hotspots.
import { ComputerDetails, NotebookDetails, ApplianceDetails, ChairDetails, PlantDetails, RadioDetails } from './PixelDeskDetails';
import { objectsAt, seasonAt } from './journeyTimeline.mjs';
import { useEffect, useRef, useState } from 'react';
import usePixelFireflies from './pixelFireflies';
import usePixelCeilingDrag from './usePixelCeilingDrag';
import { PIXEL_ROOM_LAYOUTS, pixelItemTransform, pixelRoomYear, placePixelBox } from './pixelRoomLayout.mjs';
import { CENTERED_PROJECTOR, resistedPull } from './projectorMotion.mjs';
import { DESKTOP_NOTE_BOUNDS } from './notePlacement.mjs';
import notePaper from './notePaper';
import { WORK_BOARD_TILES } from './workBoardTiles.mjs';
import styles from '../../styles/AboutJourney.module.css';

function Presence({ visible, before, transitioning, delay = 0, replay = false, children }) {
  if (!visible && !(transitioning && before)) return null;
  const changed = transitioning && (visible !== before || (visible && replay));
  const motion = changed ? (visible ? styles.itemIn : styles.itemOut) : undefined;
  return <g className={motion} style={{ '--drop-delay': `${Math.round(delay / 5)}ms`, '--item-delay': `${delay}ms` }}>{children}</g>;
}

function DesktopComputer({ current = false }) {
  return <>
    <path fill={current ? '#17221f' : '#202d2c'} d="M215 92h91v63h-91z"/>
    {current && <path fill="#0d1715" d="M306 96h5v63h-5l-5-4V98z"/>}
    <path fill="#6c8378" d="M220 97h81v51h-81z"/><path fill="#263c38" d="M224 101h73v43h-73z"/>
    <path fill="#677366" d="M254 155h13v9h14v4h-42v-4h15z"/><path fill="#c4b59a" d="M218 170h79v5h-79z"/>
    {current && <><path fill="#b7d69b" d="M292 150h4v2h-4z"/><path fill="#39473f" d="M223 172h70v1h-70z"/></>}
    <path fill="#91b4a0" d="M232 110h16v3h-16zm0 7h38v3h-38zm0 7h27v3h-27z"/><ComputerDetails/>
  </>;
}

function PixelFirefly({ index }) {
  return <g data-pixel-firefly={index} transform="translate(67 142)">
    <path fill="#c5df93" d="M-3-1h2v2h-2zm4 0h2v2H1z"/><path fill="#fff3a1" d="M-1-2h2v4h-2z"/>
  </g>;
}

function PixelPhotoFrame() {
  return <g>
    <path fill="#111917" d="M318 104h38v40h-38z"/><path fill="#26312d" d="M322 108h30v31h-30z"/>
    <path fill="#75837d" d="M331 113h12v12h-12z"/>
    <path fill="#75837d" d="M326 128h22v11h-22v-4h2v-4h3v-3h12v3h3v4h2z"/>
    <path fill="#46534e" d="M333 116h8v7h-8zm-3 17h14v6h-14z"/>
    <path fill="#0b1110" d="M332 144h10l5 8h-20z"/><path fill="#3b4943" d="M321 139h32v3h-32z"/>
  </g>;
}

function Weather({ season }) {
  const sky = { Winter: '#536c80', Spring: '#8cae9c', Monsoon: '#536c70', Autumn: '#bd9272', Night: '#101b30' }[season];
  return <><path fill={sky} d="M32 31h115v88H32z"/>
      {season !== 'Monsoon' && <path fill={season === 'Autumn' ? '#f1c58c' : '#d4d5ac'} d="M116 43h13v13h-13z"/>}
      <path fill={season === 'Night' ? '#29374b' : '#b0b8aa'} d="M42 49h24v5H37v5h40v-6H66v-7H48v3m42 25h24v5H85v5h40v-5h-11v-9H96v4"/>
      <path fill={season === 'Night' ? '#1a2939' : '#52645c'} d="M32 90h15V76h15v20h12V84h19v15h10V88h22V78h12v19h10v22H32z"/>
      <path fill={season === 'Night' ? '#142331' : '#344c49'} d="M32 106h22V94h17v25h8V99h20v20h13v-16h21v-9h14v25H32z"/>
      <path fill="#d6bc7e" d="M58 99h4v5h-4zm25 6h4v5h-4zm34 2h4v5h-4zm20-7h4v5h-4z"/>
      {season === 'Monsoon' && <path stroke="#98b2b3" strokeWidth="2" d="M40 40v7m22 19v9m19-35v8m24 9v8m24-28v9M39 79v8m47-10v8m48-11v8"/>}</>;
}

const OBJECT_ITEMS = {
  lamp: 'lamp', notebook: 'notebook', computer: 'computer', github: 'work-projection', leetcode: 'work-projection', cribble: 'work-projection', office: 'work-projection',
  upliance: 'upliance', radio: 'radio', ceiling: 'ceiling-light', window: 'window',
};

const PIXEL_NOTE_AREA={left:160,right:371,top:35,bottom:133,size:17};
function pixelNotePosition(note) {
  const xProgress=(note.x-DESKTOP_NOTE_BOUNDS.minX)/(DESKTOP_NOTE_BOUNDS.maxX-DESKTOP_NOTE_BOUNDS.minX);
  const yProgress=(note.y-DESKTOP_NOTE_BOUNDS.minY)/(DESKTOP_NOTE_BOUNDS.maxY-DESKTOP_NOTE_BOUNDS.minY);
  return {
    x:PIXEL_NOTE_AREA.left+xProgress*(PIXEL_NOTE_AREA.right-PIXEL_NOTE_AREA.left)-PIXEL_NOTE_AREA.size/2,
    y:PIXEL_NOTE_AREA.bottom-yProgress*(PIXEL_NOTE_AREA.bottom-PIXEL_NOTE_AREA.top)-PIXEL_NOTE_AREA.size/2,
  };
}
function PixelWallNotes({ notes }) {
  return notes.map(note=>{
    const {x,y}=pixelNotePosition(note),colors=notePaper(note.id);
    return <g key={note.id} transform={`translate(${x} ${y})`}>
      <path fill={colors.base} d={`M0 0h${PIXEL_NOTE_AREA.size}v${PIXEL_NOTE_AREA.size}H0z`}/>
      <path fill={colors.band} d={`M0 0h${PIXEL_NOTE_AREA.size}v2H0z`}/>
      <path stroke={colors.shade} strokeWidth=".7" d="M3 6h11M3 9h9M3 12h10"/>
    </g>;
  });
}

function PixelWorkIcon({ tile, x, y, size=20 }) {
  const unit=size/(tile.iconGrid||16);
  return <g>{tile.icon.map(([left,top,width,height,color],index)=><rect key={index} fill={color||tile.ink} x={x+left*unit} y={y+top*unit} width={width*unit} height={height*unit}/>)}</g>;
}

function PixelGithubActivityProjection() {
  const levels=[0,0,1,0,2,3,1,0,0,2,4,1,0,1,0,3,2,0,0,4,3,1,0,1,2,0,0,3];
  const colors=['#243c32','#426c55','#619071','#91b885','#d8e0b5'];
  return <g aria-label="GitHub public activity projection">
    <path fill="#14251e" d="M176 62h54v24h-54z"/><path fill="#7e987d" d="M176 62h54v1H176zM176 62h1v24h-1z"/>
    <text x="179" y="67" fill="#d8e0b5" fontSize="3.3" fontFamily="MascotPixel, monospace">GIT / LOG</text>
    {levels.map((level,index)=><path key={index} fill={colors[level]} d={`M${179+(index%7)*7} ${70+Math.floor(index/7)*4}h5v3h-5z`}/>)}
    <path fill="none" stroke="#fff0ae" strokeWidth=".8" d="M214 73h6v4h-6z"/><path fill="#d8e0b522" d="M177 82h52v1h-52z"/>
  </g>;
}

function PixelCribbleProjection() {
  return <g aria-label="Cribble community build projection">
    <path fill="#213127" d="M176 98h54v28h-54z"/><path fill="#a6b494" d="M176 98h54v1H176z"/>
    <text x="179" y="104" fill="#dce5cf" fontSize="3.1" fontFamily="MascotPixel, monospace">CRIBBLE / 3K</text>
    <path fill="#718e70" d="M180 109h13v11h-13zM196 107h12v13h-12zM211 111h14v9h-14z"/>
    <path fill="#d8e0b5" d="M182 112h9v2h-9zm16-2h8v2h-8zm15 4h10v2h-10z"/><path fill="#d8e0b522" d="M177 123h52v1h-52z"/>
  </g>;
}

function PixelOfficeProjection() {
  return <g aria-label="Office Solutions benchmark projection">
    <path fill="#30251f" d="M250 98h54v28h-54z"/><path fill="#bb957d" d="M250 98h54v1H250z"/>
    <text x="253" y="104" fill="#f0d7bc" fontSize="3.1" fontFamily="MascotPixel, monospace">POWER BI / LAB</text>
    <path fill="#bb957d" d="M254 118h8v3h-8zm14-5h8v8h-8zm14-8h8v16h-8z"/><path fill="none" stroke="#d8c58e" strokeWidth="1" d="M253 122h39"/>
    <text x="253" y="109" fill="#d8c58e" fontSize="2.6" fontFamily="MascotPixel, monospace">3 WKS  /  50+ TESTS</text>
  </g>;
}

function PixelItem({ id, layout, children }) {
  const placement=layout[id],transform=pixelItemTransform(id,placement);
  return placement && transform ? <g data-pixel-item={id} transform={transform}>{children}</g> : null;
}

const cloneLayouts=()=>JSON.parse(JSON.stringify(PIXEL_ROOM_LAYOUTS));

function PixelLayoutEditor({ year, layouts, selected, onSelect, onChange, onResetYear, onResetAll }) {
  const [copied,setCopied]=useState(false);
  const placement=layouts[year][selected];
  const output=JSON.stringify(layouts,null,2);
  if(!placement)return null;
  const fields=[['x',-100,580],['y',-100,340],['width',1,480],['height',1,240]];
  const copy=async()=>{
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1400); }
    catch { setCopied(false); }
  };
  return <aside className={styles.pixelLayoutEditor} aria-label="Pixel room layout editor">
    <header><strong>{year} layout</strong><button type="button" onClick={copy}>{copied?'Copied':'Copy all years'}</button></header>
    <label>Item<select value={selected} onChange={event=>onSelect(event.target.value)}>{Object.keys(layouts[year]).map(id=><option key={id} value={id}>{id}</option>)}</select></label>
    {fields.map(([field,min,max])=><label key={field}><span>{field}</span><input type="range" min={min} max={max} step="1" value={placement[field]} onChange={event=>onChange(field,Number(event.target.value))}/><input type="number" min={min} max={max} step="1" value={placement[field]} onChange={event=>onChange(field,Number(event.target.value))}/></label>)}
    <div className={styles.pixelLayoutActions}><button type="button" onClick={onResetYear}>Reset {year}</button><button type="button" onClick={onResetAll}>Reset all</button></div>
    <textarea readOnly value={output} aria-label="Copy-ready layouts for every year"/>
  </aside>;
}

function objectBoxAt(object, layout) {
  const item=OBJECT_ITEMS[object.id];
  return item ? placePixelBox(object.box,item,layout[item]) : object.box;
}

export default function PixelDeskScene({ month, previousMonth = month, transitioning = false, disabled = false, layoutEditor = false, lampOn = true, radioPlaying = false, ceilingOn = true, wallNotes = [], projectorState=CENTERED_PROJECTOR, onProjectorChange, onSelect, objectRefs }) {
  const [draftLayouts,setDraftLayouts]=useState(cloneLayouts);
  const pixelProjectorOn=projectorState.powered,pixelPull=projectorState.pull||CENTERED_PROJECTOR.pull;
  const pixelProjectorOffset={x:pixelPull.x*55,y:-pixelPull.y*28};
  const [pixelProjectorFlicker,setPixelProjectorFlicker]=useState(false);
  const pixelProjectorDrag=useRef(null),pixelProjectorDragged=useRef(false),pixelProjectorFrame=useRef(0),pixelFlickerTimer=useRef(0),pixelPullRef=useRef(pixelPull);
  useEffect(()=>{pixelPullRef.current=pixelPull;},[pixelPull]);
  useEffect(()=>()=>{cancelAnimationFrame(pixelProjectorFrame.current);clearTimeout(pixelFlickerTimer.current);},[]);
  const flickerPixelProjector=()=>{
    setPixelProjectorFlicker(true);clearTimeout(pixelFlickerTimer.current);
    pixelFlickerTimer.current=setTimeout(()=>setPixelProjectorFlicker(false),500);
  };
  const setPixelPull=next=>{pixelPullRef.current=next;onProjectorChange?.(current=>({...current,pull:next}));};
  const startPixelProjectorDrag=event=>{
    event.stopPropagation();cancelAnimationFrame(pixelProjectorFrame.current);pixelProjectorDragged.current=false;
    pixelProjectorDrag.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,pull:{...pixelPullRef.current},svg:event.currentTarget.ownerSVGElement.getBoundingClientRect()};
    event.currentTarget.setPointerCapture?.(event.pointerId);flickerPixelProjector();
  };
  const movePixelProjector=event=>{
    const active=pixelProjectorDrag.current;if(!active||active.pointerId!==event.pointerId)return;
    event.stopPropagation();const dx=event.clientX-active.x,dy=event.clientY-active.y;
    if(Math.hypot(dx,dy)>3)pixelProjectorDragged.current=true;
    setPixelPull({x:resistedPull(active.pull.x,dx/Math.max(1,active.svg.width)*3.2),y:resistedPull(active.pull.y,-dy/Math.max(1,active.svg.height)*3)});
    flickerPixelProjector();
  };
  const endPixelProjectorDrag=event=>{
    const active=pixelProjectorDrag.current;if(!active||active.pointerId!==event.pointerId)return;
    event.stopPropagation();event.currentTarget.releasePointerCapture?.(event.pointerId);pixelProjectorDrag.current=null;flickerPixelProjector();
    const from={...pixelPullRef.current},started=performance.now(),duration=900;
    const animate=now=>{const progress=Math.min(1,(now-started)/duration),envelope=(1-progress)**2,oscillation=Math.cos(progress*Math.PI*4);setPixelPull({x:from.x*envelope*oscillation,y:from.y*envelope*oscillation});if(progress<1)pixelProjectorFrame.current=requestAnimationFrame(animate);else setPixelPull({x:0,y:0});};
    pixelProjectorFrame.current=requestAnimationFrame(animate);
  };
  const togglePixelProjector=event=>{event.stopPropagation();if(pixelProjectorDragged.current){pixelProjectorDragged.current=false;return;}onProjectorChange?.(current=>({...current,powered:!current.powered}));};
  const year=pixelRoomYear(month),layouts=layoutEditor?draftLayouts:PIXEL_ROOM_LAYOUTS;
  const [selectedItem,setSelectedItem]=useState('lamp');
  useEffect(()=>{
    if(!layoutEditor)return;
    try {
      const saved=JSON.parse(localStorage.getItem('pixel-room-layout-draft-v3'));
      if(saved?.['2021']&&saved?.['2025']&&saved?.['2026'])setDraftLayouts(Object.fromEntries(Object.keys(PIXEL_ROOM_LAYOUTS).map(savedYear=>[savedYear,{...PIXEL_ROOM_LAYOUTS[savedYear],...saved[savedYear]}])));
    } catch {}
  },[layoutEditor]);
  useEffect(()=>{
    if(!layoutEditor)return;
    if(!draftLayouts[year][selectedItem])setSelectedItem(Object.keys(draftLayouts[year])[0]);
  },[layoutEditor,draftLayouts,year,selectedItem]);
  const updatePlacement=(field,value)=>setDraftLayouts(current=>{
    const next={...current,[year]:{...current[year],[selectedItem]:{...current[year][selectedItem],[field]:value}}};
    try { localStorage.setItem('pixel-room-layout-draft-v3',JSON.stringify(next)); } catch {}
    return next;
  });
  const resetYear=()=>setDraftLayouts(current=>{
    const next={...current,[year]:JSON.parse(JSON.stringify(PIXEL_ROOM_LAYOUTS[year]))};
    try { localStorage.setItem('pixel-room-layout-draft-v3',JSON.stringify(next)); } catch {}
    return next;
  });
  const resetAll=()=>{const next=cloneLayouts();setDraftLayouts(next);try { localStorage.removeItem('pixel-room-layout-draft-v3'); } catch {}};
  const activeLayout=layouts[year],previousLayout=layouts[pixelRoomYear(previousMonth)];
  const layout=transitioning ? {...previousLayout,...activeLayout} : activeLayout;
  const season = month >= 60 ? 'Night' : seasonAt(month), current = month >= 60, graduationRoom = year === '2025', radioVisible = month >= 56;
  const swarmRef = usePixelFireflies(current);
  const ceilingDrag = usePixelCeilingDrag(current && !disabled && !transitioning, swarmRef);
  return <div ref={swarmRef} className={styles.sceneFrame}>
    <svg className={styles.art} viewBox="0 0 480 240" shapeRendering="crispEdges" role="img" onPointerDown={event=>{if(!layoutEditor)return;const item=event.target.closest?.('[data-pixel-item]')?.dataset.pixelItem;if(item&&activeLayout[item])setSelectedItem(item);}} aria-label={`${season} outside a pixel desk room. ${current ? 'The shared monitor, chair, keyboard and drawer desk sit beside the upliance. Height: 5 feet 6 inches.' : graduationRoom ? 'A desk projector displays the Work and Build archive on the wall. Height: 5 feet 4 inches.' : 'The shared monitor, chair, keyboard and drawer desk fill the workspace. Height: 5 feet 2 inches.'}`}>
      <path fill="#40483a" d="M0 0h480v185H0z"/><path fill="#354033" d="M360 0h120v185H360z"/>
      <path fill="#30392f" d="M0 181h480v7H0z"/><path fill="#685340" d="M0 188h480v52H0z"/>
      <path stroke="#574836" strokeWidth="2" d="M0 207h480M0 229h480M62 188v19m114 0v22m-74 0v11m201-52v19m97 0v22m-69 0v11"/>
      {/* Six-foot chalk scale: floor at 180, six feet at 20. */}
      <PixelItem id="height-scale" layout={layout}><g aria-hidden="true" opacity=".25" fill="#c2c2af" stroke="#c2c2af" shapeRendering="geometricPrecision" strokeLinecap="round">
        <path fill="none" strokeWidth=".65" strokeDasharray="2.5 1 .6 1.2" d="M472 20l.3 41-.5 39 .4 40-.2 40"/>
        {Array.from({length:13},(_,i)=><path key={i} opacity={i%2 ? .5 : .8} strokeWidth=".6" d={`M${i%2 ? 470 : 468} ${180-i*160/12}h${i%2 ? 2 : 4}`}/>)}
        <text x="469" y="17" textAnchor="end" stroke="none" fontSize="5" fontFamily="'Bradley Hand', cursive">6′</text>
        <path fill="none" strokeWidth=".8" strokeDasharray="3 1 2 .6" d="M465 42.2l9-.3"/>
        <text x="464" y="46" textAnchor="end" stroke="none" fontSize="5" fontFamily="'Bradley Hand', cursive" transform="rotate(-3 464 46)">5′2″</text>
        {month >= 48 && <><path fill="none" strokeWidth=".8" strokeDasharray="2 .6 3 1" d="M465 37.8l9 .2"/><text x="464" y="39" textAnchor="end" stroke="none" fontSize="5" fontFamily="'Bradley Hand', cursive">5′4″</text></>}
        {current && <><path fill="none" strokeWidth=".8" strokeDasharray="3 .7 1 1" d="M465 33.3l9-.2"/><text x="464" y="32" textAnchor="end" stroke="none" fontSize="5" fontFamily="'Bradley Hand', cursive" transform="rotate(2 464 32)">5′6″</text></>}
      </g></PixelItem>
      <PixelItem id="window" layout={layout}><g transform="translate(36 0) scale(.8 1)">
      <path fill="#7d7153" d="M22 21h135v111H22z"/><path fill="#202f2e" d="M27 26h125v99H27z"/>{transitioning && (previousMonth >= 60 ? 'Night' : seasonAt(previousMonth)) !== season && <g className={styles.weatherOut}><Weather season={(previousMonth >= 60 ? 'Night' : seasonAt(previousMonth))}/></g>}
      <g key={season} className={transitioning && (previousMonth >= 60 ? 'Night' : seasonAt(previousMonth)) !== season ? styles.weatherIn : undefined}><Weather season={season}/></g>
      <path fill="#776b50" d="M87 27h5v97h-5zM27 78h125v5H27zM17 125h145v7H17z"/>
      </g></PixelItem>
      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={65}><PixelWallNotes notes={wallNotes}/></Presence>
      {current && ceilingOn && <PixelItem id="ceiling-light" layout={layout}><g data-pixel-fixture><path data-firefly-light fill="#efd29712" d="M395 37h36l49 149H346z"/></g></PixelItem>}
      <PixelItem id="desk" layout={layout}><path fill="#b28b5e" d="M94 165h273v9H94z"/><path fill="#76533c" d="M98 174h265v10H98z"/><path fill="#302f28" d="M103 184h9v43h-9zm245 0h9v43h-9z"/>
      <g transform="translate(-205 0)">
        <path fill="#8f6846" d="M313 184h35v28h-35z"/><path fill="#c0a277" d="M325 194h10v3h-10z"/>
        <path stroke="#936d4b" strokeWidth=".7" fill="none" d="M316 186h29v23h-29zM325 199h10"/>
        <path fill="#c6a779" d="M324 194h11v1h-11z"/>
      </g>
      <path fill="#d1a875" d="M96 166h269v1H96z"/>
      <path stroke="#936d4b" strokeWidth=".7" fill="none" d="M100 170h32m60 0h20m98 0h51"/></PixelItem>
      {/* Lamp and notebook keep one shared placement across all three chapters. */}
      <PixelItem id="lamp" layout={layout}>
        {lampOn && <path fill="#efc87d18" d="M113 139h18l18 34h-54z"/>}
        <path fill="#303a32" d="M108 169h29v4h-29zm12-31h4v31h-4z"/>
        <path fill="#59675b" d="M120 139l-10-9 3-3 11 10z"/>
        <path fill="#5d6757" d="M104 126h18l5 10h-28z"/><path fill={lampOn ? '#f0cf83' : '#68705e'} d="M104 136h19v3h-19z"/>
        <path fill="#87917b" d="M120 166h5v3h-5z"/>
      </PixelItem>
      <PixelItem id="notebook" layout={layout}>
        <path fill="#d7cba4" d="M142 155h20v-2h5v2h20v17h-45z"/><path stroke="#8c8969" d="M164 155v16m-17-10h12m10 0h12m-34 5h12m10 0h12"/>
        <NotebookDetails/>
      </PixelItem>
      <Presence visible={month >= 48 && month < 60} before={previousMonth >= 48 && previousMonth < 60} transitioning={transitioning} delay={100}>
        <PixelItem id="work-projection" layout={layout}>
        {pixelProjectorOn&&<g transform={`translate(${pixelProjectorOffset.x} ${pixelProjectorOffset.y})`} className={pixelProjectorFlicker?styles.pixelProjectorFlicker:undefined}>
          <path fill="#d8e0b51a" d="M237 28L165 38h150l-72-10z"/>
          <path fill="#172820" d="M165 38h150v98H165z"/><path fill="#7e987d" d="M165 38h150v2H165zM165 38h2v98h-2z"/>
          <path fill="#30493b" d="M170 44h140v11H170z"/>
          <text x="176" y="52" fill="#d5d8a7" fontSize="6" fontFamily="MascotPixel, monospace">WORK / BUILD 2025</text>
          <path fill={WORK_BOARD_TILES[0].color} d="M174 60h58v28h-58z"/>
          <path fill={WORK_BOARD_TILES[1].color} d="M248 60h58v28h-58z"/>
          <PixelGithubActivityProjection/>
          <PixelWorkIcon tile={WORK_BOARD_TILES[1]} x={265} y={62} size={24}/>
          <path fill={WORK_BOARD_TILES[2].color} d="M174 96h58v33h-58z"/>
          <PixelCribbleProjection/>
          <path fill="#647e64" d="M181 126h44v1h-44z"/>
        </g>}
        </PixelItem>
        <PixelItem id="projector" layout={layout}>
        <path fill="none" stroke="#303a34" strokeWidth="2" d={`M240 0L${240+pixelProjectorOffset.x} ${10+pixelProjectorOffset.y}`}/>
        <g transform={`translate(${pixelProjectorOffset.x} ${pixelProjectorOffset.y})`} onPointerDown={startPixelProjectorDrag} onPointerMove={movePixelProjector} onPointerUp={endPixelProjectorDrag} onPointerCancel={endPixelProjectorDrag} onClick={togglePixelProjector} style={{cursor:'grab',touchAction:'none'}} aria-label={`Projector · ${pixelProjectorOn?'turn off':'turn on'} or drag`}>
          <path fill="#59665b" d="M230 8h20v3h-20z"/>
          <path fill="#4f5b50" d="M222 11h36v14h-36z"/><path fill="#758375" d="M225 9h30v4h-30z"/>
          <path fill={pixelProjectorOn?'#d8e0b5':'#55584c'} d="M237 24h6v4h-6z"/><path fill="#313b34" d="M229 25h22v3h-22z"/>
        </g>
        </PixelItem>
      </Presence>
      <Presence visible={month >= 50 && month < 60} before={previousMonth >= 50 && previousMonth < 60} transitioning={transitioning} delay={300}>
        <PixelItem id="work-projection" layout={layout}>
        {pixelProjectorOn&&<g transform={`translate(${pixelProjectorOffset.x} ${pixelProjectorOffset.y})`} className={pixelProjectorFlicker?styles.pixelProjectorFlicker:undefined}>
          <path fill={WORK_BOARD_TILES[3].color} d="M248 96h58v33h-58z"/>
          <PixelOfficeProjection/>
          <path fill="#917259" d="M255 126h44v1h-44z"/>
        </g>}
        </PixelItem>
      </Presence>
      {/* The physical monitor sits in front of the wall projection, so paint it after every projected tile. */}
      <PixelItem id="computer" layout={layout}><DesktopComputer current/></PixelItem>

      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={100}>
        <PixelItem id="photo-frame" layout={layout}><PixelPhotoFrame/></PixelItem>
      </Presence>

      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={80}>
        <PixelItem id="upliance" layout={layout}>
        {/* Stool and appliance echo the main room model: tapered jar, raised lid, light ring, and angled display. */}
        <path fill="#9c8156" d="M382 186h65v7h-65z"/><path fill="#35372d" d="M388 193h6v32h-6zm46 0h6v32h-6z"/>
        <path fill="#aeb5a2" d="M394 153h42l4 25-5 7h-39l-6-8z"/><path fill="#7e887c" d="M390 174h49v9h-49z"/>
        <path fill="#a3b4ac" d="M400 131h26l4 22-5 5h-20l-6-6z"/><path fill="#d8d6bd" d="M397 125h31v6h-31z"/>
        <path fill="#2d3935" d="M400 121h26v4h-26zm5 39h22l4 14h-26z"/><path fill="#78a6a2" d="M409 164h15v6h-15z"/>
        <path fill="#397eff" opacity=".8" d="M400 128h27v2h-27z"/><path fill="#677d73" d="M427 134h8v17h-8v-4h4v-9h-4z"/><ApplianceDetails/>
        <path fill="#eee7d7" d="M406 135h15v14h-15z"/><image href="/images/journey/upliance-logo.png" x="407" y="135.5" width="13" height="13" preserveAspectRatio="xMidYMid meet"/>
        </PixelItem>
      </Presence>
      <Presence visible={month >= 56} before={previousMonth >= 56} transitioning={transitioning} delay={10}><PixelItem id="plant" layout={layout}><g transform="translate(-42 -114) scale(1.6 2)">
        <PlantDetails/>
      </g></PixelItem></Presence>



      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={90}><PixelItem id="ceiling-light" layout={layout}><path data-pixel-rope fill="none" stroke="#252d29" strokeWidth="3" d="M414 0 Q414 12 414 23"/><g data-pixel-fixture><g transform="translate(154 0)">
        <path fill="#b9a275" d="M244 22h31v5h-31zm-8 5h47v7h-47z"/><path data-firefly-light={ceilingOn ? true : undefined} fill={ceilingOn ? '#e7ce8c' : '#686d55'} d="M240 34h39v3h-39z"/><path fill="#d6bc86" d="M246 23h27v1h-27zM239 28h41v2h-41z"/><path fill="#6e6548" d="M238 32h43v1h-43z"/>
      </g></g></PixelItem></Presence>
      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={5}><PixelItem id="hoop" layout={layout}><g transform="translate(-235.4 20) scale(.62)">
        <path fill="#bda981" d="M391 29h54v40h-54z"/><path fill="#e1d3b2" d="M395 33h46v32h-46z"/><path fill="none" stroke="#a75c3f" strokeWidth="2" d="M409 47h18v14h-18zM403 65h31"/>
        <path fill="none" stroke="#c5c1a5" strokeWidth="1.5" d="M405 68l4 17h19l4-17m-22 0l4 17m12-17l-4 17m-15-11h24m-22 6h20"/>
      </g></PixelItem></Presence>

      <Presence visible={radioVisible} before={previousMonth >= 56} transitioning={transitioning} delay={20}><PixelItem id="radio" layout={layout}><g transform="translate(72 -15)">
        <path fill="#b29a70" d="M29 164h40v16H29z"/><path fill="#343e32" d="M33 167h18v9H33z"/><path fill="#d0c09a" d="M56 167h7v7h-7z"/><path fill={radioPlaying ? '#a5cf80' : '#5a6249'} d="M64 176h3v2h-3z"/><path stroke="#a7a68a" d="M35 169h14m-14 3h14M61 164v-18"/><RadioDetails/>
        {radioPlaying&&<g className={styles.pixelMusicNotes}><g transform="translate(59 154)"><g className={styles.pixelMusicNote}><path fill="#f1d28b" d="M0 5h2v-5h1v7H0zM3 0h4v1H3z"/></g></g><g transform="translate(68 146)"><g className={styles.pixelMusicNote}><path fill="#a8d9cb" d="M0 5h2v-5h1v7H0z"/></g></g><g transform="translate(77 155)"><g className={styles.pixelMusicNote}><path fill="#f1d28b" d="M0 5h2v-4h1v4h3v-4h1v6H0zm3-4h4v1H3z"/></g></g></g>}
      </g></PixelItem></Presence>
      <PixelItem id="desk" layout={layout}><g>
        {/* The shared dark wood lip and left drawer stack stay fixed across all three chapters. */}
        <path fill="#4d392e" d="M96 174h269v10H96z"/><path fill="#8b6246" d="M99 176h60v7H99z"/>
        <path fill="#5d4435" d="M104 184h54v35h-54z"/><path fill="#9c7353" d="M108 188h46v12h-46zm0 16h46v12h-46z"/>
        <path fill="#c0a277" d="M128 193h9v2h-9zm0 16h9v2h-9z"/>
      </g></PixelItem>
      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={60}>
        {/* One enlarged wearable frame represents the selectable lens collection on the real desk. */}
        <PixelItem id="glasses" layout={layout}><g transform="translate(319 160)">
          <path fill="#8fb3b0" d="M0 0h8v7H0zm12 0h8v7h-8z"/><path fill="#263630" d="M2 2h4v3H2zm12 0h4v3h-4zM8 2h4v2H8zM0 1l-4-2v2l4 3zm20 0l4-2v2l-4 3z"/>
        </g></PixelItem>
      </Presence>
      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={45}>
        {/* The three starter paper balls mirror the throwable pile in the main room. */}
        <PixelItem id="paper" layout={layout}>
        {[190,198,206].map((x,index)=><g key={index} transform={`translate(${x} 163)`}>
          <path fill="#ded8c8" d="M0 1l2-3 4 1 2 4-3 3-4-1z"/><path fill="none" d="M2 0l3 3m-4 1l4-2" strokeWidth=".6" stroke="#9e998d"/>
        </g>)}
        </PixelItem>
      </Presence>
      <PixelItem id="fireflies" layout={layout}>{['striker','follower','scout'].map((role,index)=><Presence key={role} visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={10+index*8}>
        <PixelFirefly role={role} index={index}/>
      </Presence>)}</PixelItem>
      <PixelItem id="chair" layout={layout}><g>
      <path fill="#293b35" d="M231 190h52v27h-52z"/><path fill="#4f6250" d="M228 187h58v24h-58z"/><path fill="#27362f" d="M253 213h8v19h-8zm-20 18h48v4h-48z"/>
      <ChairDetails/>
      </g></PixelItem>
      {layoutEditor&&activeLayout[selectedItem]&&<rect className={styles.pixelLayoutSelection} x={activeLayout[selectedItem].x} y={activeLayout[selectedItem].y} width={activeLayout[selectedItem].width} height={activeLayout[selectedItem].height} vectorEffect="non-scaling-stroke" pointerEvents="none"/>}
    </svg>
    {current&&wallNotes.map((note,index)=>{const {x,y}=pixelNotePosition(note);return <button key={`note-${note.id}`} ref={node=>{if(index===0)objectRefs.current.notes=node;}} className={styles.hotspot} disabled={transitioning||disabled} aria-label={`View sticky note ${index+1} on the wall`} onClick={()=>onSelect?.('notes',note)} style={{left:`${x/4.8}%`,top:`${y/2.4}%`,width:`${PIXEL_NOTE_AREA.size/4.8}%`,height:`${PIXEL_NOTE_AREA.size/2.4}%`}}><span>Sticky note</span></button>;})}
    {objectsAt(month).filter(object=>{const item=OBJECT_ITEMS[object.id],projected=['github','leetcode','cribble','office'].includes(object.id);return (!projected||pixelProjectorOn)&&(!item||!!activeLayout[item]);}).map(object => { const box=objectBoxAt(object,activeLayout),item=OBJECT_ITEMS[object.id],projected=['github','leetcode','cribble','office'].includes(object.id),offsetX=projected?pixelProjectorOffset.x:0,offsetY=projected?pixelProjectorOffset.y:0; return <button {...(object.id === "ceiling" && !layoutEditor ? ceilingDrag : {})} data-ceiling-hotspot={object.id === "ceiling" ? true : undefined} key={object.id} ref={node => { objectRefs.current[object.id] = node; }} className={styles.hotspot} disabled={transitioning || disabled} aria-label={object.id === 'lamp' ? `Desk lamp · turn ${lampOn ? 'off' : 'on'}` : object.id === 'radio' ? `Radio · ${radioPlaying ? 'turn music off' : 'play music'}` : object.id === 'ceiling' ? `Ceiling light · turn ${ceilingOn ? 'off' : 'on'}` : `Explore ${object.label}`} aria-pressed={object.id === 'lamp' ? lampOn : object.id === 'radio' ? radioPlaying : object.id === 'ceiling' ? ceilingOn : undefined} title={layoutEditor&&item?`Edit ${item}`:object.label} onClick={() => layoutEditor&&item ? setSelectedItem(item) : onSelect?.(object.id)} style={{ touchAction: object.id === "ceiling" && !layoutEditor ? "none" : undefined, left: `${(box[0]+offsetX) / 4.8}%`, top: `${(box[1]+offsetY) / 2.4}%`, width: `${box[2] / 4.8}%`, height: `${box[3] / 2.4}%` }}><span>{object.label}</span></button>; })}
    {layoutEditor&&<PixelLayoutEditor year={year} layouts={draftLayouts} selected={selectedItem} onSelect={setSelectedItem} onChange={updatePlacement} onResetYear={resetYear} onResetAll={resetAll}/>}
  </div>;
}
