import { useEffect, useState } from 'react';
import styles from '../../styles/Workbench.module.css';

const fields = [
  ['minAzimuth','Left limit (degrees)',-170,170,1],
  ['maxAzimuth','Right limit (degrees)',-170,170,1],
  ['minPolar','Upper limit (degrees)',10,89,1],
  ['maxPolar','Lower limit (degrees)',11,90,1],
  ['minDistance','Closest zoom',2,60,.1],
  ['maxDistance','Farthest zoom',3,100,.1],
];
const storageKey='workbench-camera-settings';
export default function CameraControls({ api }) {
  const [open,setOpen]=useState(false), [snapshot,setSnapshot]=useState(null);
  const [status,setStatus]=useState(''), [text,setText]=useState('');
  useEffect(()=>{
    if(!open)return;
    const update=()=>{const next=api.current?.read();if(next)setSnapshot(next);};
    update();const timer=setInterval(update,200);
    return ()=>clearInterval(timer);
  },[open,api]);
  const apply=values=>{
    try { api.current?.apply(values);setSnapshot(api.current?.read());setStatus('Applied. Drag or scroll the room to try it.'); }
    catch(error){setStatus(error.message);}
  };
  const save=()=>{
    const value=api.current?.read();if(!value)return;
    const json=JSON.stringify(value,null,2);setText(json);
    try{localStorage.setItem(storageKey,json);setStatus('Saved in this browser. Copy settings to send them in chat.');}
    catch{setStatus('Browser storage unavailable. Copy the settings below.');}
  };
  const copy=async()=>{
    const value=api.current?.read();if(!value)return;
    const json=JSON.stringify(value,null,2);setText(json);
    try{await navigator.clipboard.writeText(json);setStatus('Copied — paste these settings in chat.');}
    catch{setStatus('Select and copy the settings below.');}
  };
  return <details className={styles.cityControls} onToggle={event=>setOpen(event.currentTarget.open)}>
    <summary>Room camera settings</summary>
    {open&&snapshot&&<>
      <p>Drag to choose a view. Scroll or pinch to zoom. Limits apply immediately.</p>
      <p>Position: {snapshot.position.map(n=>n.toFixed(3)).join(', ')}<br/>
        Target: {snapshot.target.map(n=>n.toFixed(3)).join(', ')}<br/>
        Horizontal: {snapshot.azimuth.toFixed(1)}° · Vertical: {snapshot.polar.toFixed(1)}°<br/>
        Distance: {snapshot.distance.toFixed(3)}</p>
      {fields.map(([key,label,min,max,step])=><label key={key}><span>{label}</span><input aria-label={label} type="number" min={min} max={max} step={step} value={snapshot.limits[key]} onChange={event=>{if(event.target.value!=='')apply({limits:{...snapshot.limits,[key]:Number(event.target.value)}});}}/></label>)}
      <div>{[['Set left','minAzimuth','azimuth'],['Set right','maxAzimuth','azimuth'],['Set upper','minPolar','polar'],['Set lower','maxPolar','polar'],['Set closest','minDistance','distance'],['Set farthest','maxDistance','distance']].map(([label,key,source])=><button key={key} onClick={()=>{const current=api.current.read();apply({limits:{...current.limits,[key]:current[source]}});}}>{label}</button>)}</div>
      <button onClick={save}>Save view & limits</button><button onClick={copy}>Copy settings</button>
      <button onClick={()=>{try{const saved=localStorage.getItem(storageKey);if(!saved){setStatus('No saved settings yet.');return;}apply(JSON.parse(saved));}catch{setStatus('Could not load saved settings.');}}}>Load saved</button>
      <button onClick={()=>{try{api.current?.reset();setSnapshot(api.current?.read());setStatus('Default view and limits restored.');}catch(error){setStatus(error.message);}}}>Reset</button>
      <p role="status">{status}</p>
      {text&&<textarea aria-label="Room camera settings to share" readOnly value={text} onFocus={event=>event.target.select()}/>}
    </>}
  </details>;
}
