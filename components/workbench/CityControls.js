import { useState } from 'react';
import { DEFAULT_CITY_SETTINGS } from './citySettings';
import styles from '../../styles/Workbench.module.css';
const groups = [
  ['City placement', [['x','Position X',-30,30,.1],['y','Position Y',-20,20,.1],['z','Position Z',-45,-4,.1],['scale','Scale',.1,3,.05],['rotation','Rotation',-180,180,1]]],
  ['Camera / view', [['cameraX','Camera X',-15,15,.1],['cameraY','Camera Y',-3,15,.1],['cameraZ','Camera Z',-15,8,.1],['targetX','Look at X',-30,30,.1],['targetY','Look at Y',-20,20,.1],['targetZ','Look at Z',-45,-4,.1],['fov','Field of view',25,80,1]]],
  ['Lighting / effects', [['exposure','Brightness',.1,2.5,.05],['ambient','Ambient fill',0,2,.05],['warm','Warm light',0,100,1],['cool','Cool light',0,100,1],['shadows','Shadow strength',0,1,.05],['glow','Glow',0,2.5,.05],['emissive','Window lights',0,6,.1]]],
];
export default function CityControls({ value, onChange }) {
  const [text,setText] = useState(''), [status,setStatus] = useState('');
  const copy = async () => {
    const result=JSON.stringify(value,null,2); setText(result);
    try { await navigator.clipboard.writeText(result); setStatus('Copied — paste these settings in chat.'); }
    catch { setStatus('Copy the settings below.'); }
  };
  return <details className={styles.cityControls} open>
    <summary>City settings</summary>
    {groups.map(([title,sliders])=><details key={title} open={title==='City placement'}>
      <summary>{title}</summary>
      {sliders.map(([key,label,min,max,step])=><label key={key}><span>{label}<output>{value[key].toFixed(2)}</output></span><input type="range" min={min} max={max} step={step} value={value[key]} onChange={event=>onChange(current=>({...current,[key]:Number(event.target.value)}))}/></label>)}
    </details>)}
    <div><button onClick={copy}>Copy settings</button><button onClick={()=>{onChange({...DEFAULT_CITY_SETTINGS});setText('');setStatus('');}}>Reset</button></div>
    <p role="status">{status}</p>
    {text && <textarea aria-label="City settings to copy" readOnly value={text} onFocus={event=>event.target.select()}/>}
  </details>;
}
