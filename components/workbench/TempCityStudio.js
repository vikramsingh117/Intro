// Provides a temporary three-year exterior editor with independent, copyable view settings.
// Values start from the approved production settings and persist independently in localStorage for later refinement.
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import CityExterior, { NightEffects } from './CityExterior';
import CityControls from './CityControls';
import FlyingPlane from './FlyingPlane';
import { CITY_SETTINGS_BY_YEAR } from './citySettings';
import styles from '../../styles/CityStudio.module.css';

const YEARS=['2026','2025','2021'];
const STORAGE_KEY='after-hours-temp-city-views-v1';
const ATMOSPHERE={
  '2021':{background:'#8faea8',sky:'#dce9dc',ground:'#76644e',directional:1.15,directionalColor:'#fff0cd'},
  '2025':{background:'#354e54',sky:'#aabfc0',ground:'#4c5048',directional:.7,directionalColor:'#c5d6d8'},
  '2026':{background:'#091321',sky:'#c8d4d0',ground:'#494237',directional:.8,directionalColor:'#c7d5df'},
};

function defaultViews() {
  return Object.fromEntries(YEARS.map(year=>[year,{...CITY_SETTINGS_BY_YEAR[year]}]));
}

function View({ settings, orbit }) {
  const { camera, gl, invalidate }=useThree();
  const { cameraX,cameraY,cameraZ,targetX,targetY,targetZ,fov }=settings;
  useEffect(()=>{
    camera.position.set(cameraX,cameraY,cameraZ);
    camera.fov=fov;
    camera.lookAt(targetX,targetY,targetZ);
    camera.updateProjectionMatrix();
    invalidate();
    if(!orbit)return;
    const controls=new OrbitControls(camera,gl.domElement);
    controls.target.set(targetX,targetY,targetZ);
    controls.minDistance=1;controls.maxDistance=150;
    controls.addEventListener('change',invalidate);controls.update();
    return ()=>{controls.removeEventListener('change',invalidate);controls.dispose();};
  },[camera,gl,invalidate,orbit,cameraX,cameraY,cameraZ,targetX,targetY,targetZ,fov]);
  return null;
}

export default function TempCityStudio() {
  const [year,setYear]=useState('2026');
  const [views,setViews]=useState(defaultViews);
  const [storageReady,setStorageReady]=useState(false);
  const [orbit,setOrbit]=useState(false);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    try {
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(saved)setViews(current=>Object.fromEntries(YEARS.map(item=>[item,{...current[item],...saved[item]}])));
    } catch {}
    setStorageReady(true);
  },[]);
  useEffect(()=>{
    if(!storageReady)return;
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(views)); } catch {}
  },[views,storageReady]);
  const settings=views[year];
  const updateSettings=useCallback(update=>setViews(current=>{
    const next=typeof update==='function'?update(current[year]):update;
    return {...current,[year]:next};
  }),[year]);
  const atmosphere=ATMOSPHERE[year];
  return <div className={styles.studio}>
    <Canvas shadows frameloop="demand" dpr={[1,1.5]} camera={{near:.1,far:300}} gl={{antialias:true,toneMapping:ACESFilmicToneMapping}}>
      <color attach="background" args={[atmosphere.background]}/>
      <NightEffects exposure={settings.exposure} glow={settings.glow}/>
      <hemisphereLight args={[atmosphere.sky,atmosphere.ground,settings.ambient]}/>
      <directionalLight position={[3,5,4]} intensity={atmosphere.directional} color={atmosphere.directionalColor}/>
      <Suspense fallback={null}><CityExterior settings={settings} year={year} outside rain={year==='2025'} reduced={false} onReady={setReady}/></Suspense>
      <Suspense fallback={null}><FlyingPlane active reduced={false} settings={settings} year={year}/></Suspense>
      <View settings={settings} orbit={orbit}/>
    </Canvas>
    <header className={styles.toolbar}>
      <Link href="/after-hours"><a>← Room</a></Link>
      <strong>Three-year city editor</strong>
      <nav className={styles.years} aria-label="Preview year">
        {YEARS.map(item=><button key={item} className={item===year?styles.activeYear:''} aria-pressed={item===year} onClick={()=>setYear(item)}>{item}</button>)}
      </nav>
      <button onClick={()=>setOrbit(value=>!value)}>{orbit?'Return to saved camera':'Orbit city'}</button>
    </header>
    <p className={styles.hint}>{!ready?'Loading city…':orbit?'Drag to orbit · scroll to zoom · right-drag to pan':'Adjust this year, then copy all three settings from the panel.'}</p>
    <CityControls value={settings} onChange={updateSettings} title={`${year} view settings`} copyValue={views} copyLabel="Copy all three years" resetValue={CITY_SETTINGS_BY_YEAR[year]} resetLabel="Reset active year"/>
  </div>;
}
