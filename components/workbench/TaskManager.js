// Mirrors open windows and room state, and offers a local-only browser diagnostics dashboard.
// System information is sampled on demand, never persisted, and never sent to the analytics API.
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../../styles/Workbench.module.css';
import { roomYearFor } from './roomYears.mjs';

const unavailable='Not exposed';
let cachedGraphics=null;
let memoryMeasurement=null;
const formatBytes=value=>Number.isFinite(value)?value<1024?`${value} B`:value<1024**2?`${(value/1024).toFixed(1)} KB`:value<1024**3?`${(value/1024**2).toFixed(1)} MB`:`${(value/1024**3).toFixed(2)} GB`:unavailable;
const formatMs=value=>Number.isFinite(value)&&value>0?`${Math.round(value)} ms`:unavailable;
const yesNo=value=>value===undefined?unavailable:value?'Yes':'No';

function browserName(){
  const brands=navigator.userAgentData?.brands?.filter(item=>!item.brand.includes('Not'))||[];
  if(brands.length)return brands.map(item=>`${item.brand} ${item.version}`).join(' · ');
  const match=navigator.userAgent.match(/(Firefox|Edg|Chrome|Safari)\/?\s?(\d+)?/);
  return match?`${match[1]} ${match[2]||''}`.trim():navigator.userAgent;
}

function storageBytes(storage){
  try{return Array.from({length:storage.length},(_,index)=>storage.key(index)).reduce((total,key)=>total+(key?.length||0)+(storage.getItem(key)?.length||0),0)*2;}catch{return null;}
}
function storageSummary(storage){
  try{return `${storage.length} keys · ~${formatBytes(storageBytes(storage))}`;}catch{return unavailable;}
}
function browserStorage(name){
  try{return storageSummary(window[name]);}catch{return unavailable;}
}

function webglInfo(){
  if(cachedGraphics)return cachedGraphics;
  const canvas=document.createElement('canvas');
  const gl=canvas.getContext('webgl2',{powerPreference:'high-performance'})||canvas.getContext('webgl');
  if(!gl){cachedGraphics={api:'Unavailable'};return cachedGraphics;}
  const debug=gl.getExtension('WEBGL_debug_renderer_info');
  const result={
    api:typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext?'WebGL 2':'WebGL 1',
    renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),
    vendor:debug?gl.getParameter(debug.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),
    texture:`${gl.getParameter(gl.MAX_TEXTURE_SIZE).toLocaleString()} px`,
    renderbuffer:`${gl.getParameter(gl.MAX_RENDERBUFFER_SIZE).toLocaleString()} px`,
    textureUnits:gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
  };
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  cachedGraphics=result;
  return cachedGraphics;
}

function sampleFps(duration=700){
  if(document.hidden)return Promise.resolve(null);
  return new Promise(resolve=>{
    let start=null,frames=0;
    const frame=now=>{
      if(start===null)start=now;
      frames+=1;
      const elapsed=now-start;
      if(elapsed>=duration)resolve(frames*1000/elapsed);
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

async function collectSystemInformation(){
  if(window.crossOriginIsolated&&performance.measureUserAgentSpecificMemory&&!memoryMeasurement)memoryMeasurement=performance.measureUserAgentSpecificMemory().catch(()=>null);
  const [storage,persistent,fps,memory]=await Promise.all([
    navigator.storage?.estimate?.().catch(()=>null),
    navigator.storage?.persisted?.().catch(()=>null),
    sampleFps(),
    memoryMeasurement||Promise.resolve(null),
  ]);
  const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  const navigation=performance.getEntriesByType('navigation')[0];
  const resources=performance.getEntriesByType('resource');
  const transferred=resources.reduce((total,item)=>total+(item.transferSize||0),0);
  const heap=performance.memory;
  const gl=webglInfo();
  const pointer=matchMedia('(pointer:coarse)').matches?'Coarse / touch':matchMedia('(pointer:fine)').matches?'Fine / mouse':'Unknown';
  const contrast=matchMedia('(prefers-contrast:more)').matches?'More':matchMedia('(prefers-contrast:less)').matches?'Less':'Default';
  const details=storage?.usageDetails?Object.entries(storage.usageDetails).map(([name,value])=>[name.replace(/([A-Z])/g,' $1'),formatBytes(value)]):[];
  return {
    capturedAt:new Date(),
    summary:[
      {label:'Origin storage',value:formatBytes(storage?.usage),detail:storage?.quota?`${((storage.usage||0)/storage.quota*100).toFixed(2)}% of ${formatBytes(storage.quota)}`:'Estimated across this site'},
      {label:'Live frame rate',value:Number.isFinite(fps)?`${Math.round(fps)} FPS`:unavailable,detail:'Short foreground sample'},
      {label:'Logical processors',value:navigator.hardwareConcurrency||unavailable,detail:navigator.deviceMemory?`~${navigator.deviceMemory} GB device memory`:'Memory estimate unavailable'},
      {label:'Connection',value:navigator.onLine?(connection?.effectiveType?.toUpperCase()||'Online'):'Offline',detail:connection?.rtt?`~${connection.rtt} ms RTT`:'Browser-reported state'},
    ],
    sections:[
      {title:'Browser & device',icon:'▣',rows:[
        ['Browser',browserName()],['Platform',navigator.userAgentData?.platform||navigator.platform||unavailable],['Language',navigator.languages?.join(', ')||navigator.language||unavailable],['Time zone',Intl.DateTimeFormat().resolvedOptions().timeZone||unavailable],['Logical processors',navigator.hardwareConcurrency||unavailable],['Approx. device memory',navigator.deviceMemory?`${navigator.deviceMemory} GB`:unavailable],['Touch points',navigator.maxTouchPoints||0],['Primary pointer',pointer],
      ]},
      {title:'Display',icon:'▤',rows:[
        ['Viewport',`${window.innerWidth} × ${window.innerHeight} CSS px`],['Screen',`${screen.width} × ${screen.height} CSS px`],['Device pixel ratio',`${window.devicePixelRatio}×`],['Color depth',`${screen.colorDepth}-bit`],['Orientation',screen.orientation?.type||unavailable],['Reduced motion',yesNo(matchMedia('(prefers-reduced-motion:reduce)').matches)],['Color scheme',matchMedia('(prefers-color-scheme:dark)').matches?'Dark':'Light'],['Contrast preference',contrast],
      ]},
      {title:'Storage',icon:'◫',note:'Origin-wide estimate, not this tab. Values may be rounded by the browser.',rows:[
        ['Used by this origin',formatBytes(storage?.usage)],['Estimated quota',formatBytes(storage?.quota)],['Persistent storage',persistent===null?unavailable:yesNo(persistent)],['localStorage',browserStorage('localStorage')],['sessionStorage',browserStorage('sessionStorage')],...details,
      ]},
      {title:'Network',icon:'⌁',rows:[
        ['Status',navigator.onLine?'Online':'Offline'],['Effective type',connection?.effectiveType?.toUpperCase()||unavailable],['Downlink',Number.isFinite(connection?.downlink)?`~${connection.downlink} Mbps`:unavailable],['Round-trip time',Number.isFinite(connection?.rtt)?`~${connection.rtt} ms`:unavailable],['Data saver',connection?yesNo(connection.saveData):unavailable],
      ]},
      {title:'Page performance',icon:'⌁',note:'Resource transfer excludes cached or cross-origin bytes the browser withholds.',rows:[
        ['Navigation',navigation?.type||unavailable],['DOM ready',formatMs(navigation?.domContentLoadedEventEnd)],['Window loaded',formatMs(navigation?.loadEventEnd)],['Resources observed',resources.length],['Transferred this load',formatBytes(transferred)],['Live frame sample',Number.isFinite(fps)?`${fps.toFixed(1)} FPS`:unavailable],['JS heap used',heap?formatBytes(heap.usedJSHeapSize):unavailable],['App memory estimate',memory?formatBytes(memory.bytes):unavailable],['Cross-origin isolated',yesNo(window.crossOriginIsolated)],
      ]},
      {title:'Graphics',icon:'◇',rows:[
        ['API',gl.api],['Renderer',gl.renderer||unavailable],['Vendor',gl.vendor||unavailable],['Maximum texture',gl.texture||unavailable],['Maximum renderbuffer',gl.renderbuffer||unavailable],['Texture units',gl.textureUnits??unavailable],
      ]},
    ],
  };
}

export default function TaskManager({ windows, activeTitle, onFocus, onClose, room = {} }) {
  const [tab,setTab]=useState('system');
  const [system,setSystem]=useState(null);
  const [loading,setLoading]=useState(false);
  const [copyState,setCopyState]=useState('');
  const systemRef=useRef(null);
  const sampling=useRef(false);
  const chapter=roomYearFor(room.roomYear);
  const hasObject=id=>chapter.objects.includes(id);
  const roomGroups=[
    {title:'Environment',icon:'⌂',items:[
      {name:'Physical room',state:`${chapter.year} · ${chapter.label}`,detail:'Timeline-controlled chapter',tone:'info'},
      {name:'Render profile',state:room.optimised?'Optimised':'Full quality',detail:room.optimised?'Adaptive resolution and lighter effects':'Shadows, post-processing and full lens effects',tone:room.optimised?'warn':'on'},
      {name:'Monitor',state:'Active',detail:'Projected HTML desktop',tone:'on'},
      {name:'Window & city',state:room.cityReady?'Loaded':'Loading',detail:chapter.year==='2021'?'Daylight city':chapter.year==='2025'?'Rainy city':'Night city',tone:room.cityReady?'on':'loading'},
      {name:'Shared wall',state:room.notesReady?`${room.noteCount||0} notes`:'Connecting',detail:'MongoDB-backed sticky notes',tone:room.notesReady?'on':'loading'},
    ]},
    {title:'Live controls',icon:'◉',items:[
      {name:'Desk lamp',state:room.lampOn?'On':'Off',detail:'Room lighting',tone:room.lampOn?'on':'off',enabled:hasObject('desk-lamp')},
      {name:'Ceiling light',state:room.ceilingOn?'On':'Off',detail:'Pullable hanging fixture',tone:room.ceilingOn?'on':'off',enabled:hasObject('ceiling-light')},
      {name:'Radio',state:room.radioPlaying?'Playing':'Stopped',detail:'Physical and timeline controls stay synchronized',tone:room.radioPlaying?'on':'off',enabled:hasObject('radio')},
      {name:'WORK / BUILD',state:room.projectorPowered?'Powered':'Standby',detail:'Interactive projection board',tone:room.projectorPowered?'on':'off',enabled:hasObject('work-board')},
    ]},
    {title:'Interactive objects',icon:'◇',items:[
      {name:'Notebook',state:room.notebookOpen?`Open · spread ${(room.notebookPage||0)+1}`:'Closed',detail:'Page turning, tearing and saved position',tone:room.notebookOpen?'on':'off',enabled:hasObject('notebook')},
      {name:'Glasses',state:room.wearingGlasses?`Wearing ${room.glassesLens||'lens'}`:'On desk',detail:'Blur, pixel, crayon and sketch lenses',tone:room.wearingGlasses?'on':'off',enabled:hasObject('glasses-blur')},
      {name:'Upliance',state:'Ready',detail:'Lid, light guides and work display',tone:'on',enabled:hasObject('upliance')},
      {name:'Photo frame',state:'Ready',detail:'Shared visitor gallery',tone:'on',enabled:hasObject('photo')},
      {name:'Paper balls',state:`${room.paperCount||0} available`,detail:`Basket score ${room.basketScore||0}`,tone:(room.paperCount||0)>0?'on':'off',enabled:hasObject('paper-pile')},
      {name:'Top drawer',state:'Ready',detail:'Click to open or close',tone:'info',enabled:hasObject('drawer')},
    ]},
    {title:'Scene fixtures',icon:'▦',items:[
      {name:'Desk & room shell',state:'Mounted',detail:'Walls, ceiling, floor and drawers',tone:'info'},
      {name:'Keyboard & chair',state:'Mounted',detail:'Persistent furniture',tone:'info'},
      {name:'Plant',state:'Mounted',detail:'Floor decoration',tone:'info',enabled:chapter.props.includes('plant')||chapter.year==='2026'},
      {name:'Stool & Pascal',state:'Mounted',detail:'Current-room decoration',tone:'info',enabled:chapter.year==='2026'},
      {name:'Aircraft',state:'Ready',detail:'Window flyby',tone:'info',enabled:chapter.year==='2026'},
    ]},
  ];
  roomGroups.forEach(group=>{group.items=group.items.filter(item=>item.enabled!==false);});
  const roomItems=roomGroups.flatMap(group=>group.items);
  const refresh=useCallback(async()=>{
    if(sampling.current)return;
    sampling.current=true;
    const initial=!systemRef.current;
    if(initial)setLoading(true);
    try{
      const next=await collectSystemInformation();
      systemRef.current=next;setSystem(next);
    }finally{
      sampling.current=false;
      if(initial)setLoading(false);
    }
  },[]);
  useEffect(()=>{
    if(tab!=='system')return;
    refresh();
    const timer=window.setInterval(()=>{if(!document.hidden)refresh();},2000);
    return()=>window.clearInterval(timer);
  },[tab,refresh]);
  const copyReport=async()=>{
    if(!system)return;
    const text=[`System information · ${system.capturedAt.toISOString()}`,...system.sections.flatMap(section=>[`\n${section.title}`,...section.rows.map(([label,value])=>`${label}: ${value}`)])].join('\n');
    try{await navigator.clipboard.writeText(text);setCopyState('Copied');}catch{setCopyState('Copy unavailable');}
  };
  const tabs=[['system','System information'],['apps',`Apps (${windows.length})`],['room',`Room (${roomItems.length})`]];
  return <section className={styles.taskManager} aria-label="Task Manager">
    <nav aria-label="Task Manager views">{tabs.map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    {tab==='apps'&&<><p>Open desktop apps. Ending a task closes its window and clears its unsaved state.</p><ul>{windows.map(app=><li key={app.title}>
      <div><strong>{app.title}</strong><span>{app.minimized?'Minimized':app.title===activeTitle?'Active':'Open'}</span></div>
      <div className={styles.taskActions}><button onClick={()=>onFocus(app.title)} disabled={app.title===activeTitle}>Switch to</button><button onClick={()=>onClose(app.title)}>End task</button></div>
    </li>)}</ul></>}
    {tab==='room'&&<div className={styles.roomStatus}>
      <header><div><span>● LIVE SCENE</span><h2>{chapter.year} {chapter.label}</h2><p>Current 3D room state, interactive systems, and mounted scene fixtures.</p></div><strong>{roomItems.length}<small>components</small></strong></header>
      <div className={styles.roomSummary}>
        <article><small>Room chapter</small><strong>{chapter.year}</strong><span>{chapter.label}</span></article>
        <article><small>Quality</small><strong>{room.optimised?'Optimised':'Full'}</strong><span>{room.optimised?'Adaptive profile':'Complete effects'}</span></article>
        <article><small>Shared notes</small><strong>{room.notesReady?room.noteCount||0:'…'}</strong><span>{room.notesReady?'Connected':'Connecting'}</span></article>
        <article><small>Basket score</small><strong>{room.basketScore||0}</strong><span>{room.paperCount||0} paper balls ready</span></article>
      </div>
      <div className={styles.roomGroups}>{roomGroups.map(group=><section key={group.title}>
        <h3><span aria-hidden="true">{group.icon}</span>{group.title}<small>{group.items.length}</small></h3>
        <div>{group.items.map(item=><article key={item.name} data-tone={item.tone}>
          <i aria-hidden="true"/><div><strong>{item.name}</strong><span>{item.detail}</span></div><b>{item.state}</b>
        </article>)}</div>
      </section>)}</div>
    </div>}
    {tab==='system'&&<div className={styles.systemInfo}>
      <header><div><span>● LIVE · LOCAL DIAGNOSTICS · 2S</span><h2>System information</h2><p>Read directly from this browser. Nothing here is saved or sent.</p></div><div><button onClick={refresh} disabled={loading}>{loading?'Sampling…':'Refresh now'}</button><button onClick={copyReport} disabled={!system||loading}>Copy report</button></div></header>
      {copyState&&<output className={styles.systemCopyStatus} aria-live="polite">{copyState}</output>}
      {loading&&!system?<div className={styles.systemLoading} role="status"><i/><span>Sampling browser capabilities and frame rate…</span></div>:system&&<>
        <div className={styles.systemSummary}>{system.summary.map(item=><article key={item.label}><small>{item.label}</small><strong>{item.value}</strong><span>{item.detail}</span></article>)}</div>
        <p className={styles.systemCaptured}>Last sample {system.capturedAt.toLocaleTimeString()} · updates every two seconds while this tab is visible.</p>
        <div className={styles.systemSections}>{system.sections.map(section=><section key={section.title}>
          <h3><span aria-hidden="true">{section.icon}</span>{section.title}</h3>{section.note&&<p>{section.note}</p>}
          <dl>{section.rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{String(value)}</dd></div>)}</dl>
        </section>)}</div>
      </>}
    </div>}
  </section>;
}
