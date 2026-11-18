// Owns the room radio's looping music, static toggle sound, interaction state, and physical model.
// ProductWorkbench consumes playback state to coordinate the projected desktop mascot's music pose.
import useTrackedState from './useTrackedState';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box3, Vector3 } from 'three';
import InteractiveObject from './InteractiveObject';

const RADIO_VOLUME = .4 * .7 * .6 * .4 * .5;

function MusicNotes({ playing }) {
  const notes=useRef([]);
  const {invalidate}=useThree();
  const stoppedAt=useRef(null);
  const [visible,setVisible]=useState(playing);
  useEffect(()=>{
    if(playing){stoppedAt.current=null;setVisible(true);return;}
    if(visible){stoppedAt.current=performance.now();invalidate();}
  },[playing,visible,invalidate]);
  useFrame(({clock})=>{
    if(!visible)return;
    const elapsed=clock.elapsedTime;
    const ending=stoppedAt.current===null?1:Math.max(0,1-(performance.now()-stoppedAt.current)/520);
    notes.current.forEach((note,index)=>{
      if(!note)return;
      const progress=(elapsed*.34+index*.31)%1;
      const opacity=Math.sin(progress*Math.PI)*.92*ending;
      note.position.set(.1+index*.16+Math.sin(elapsed*1.7+index)*.045,.5+progress*1.1,.31+index*.018);
      note.rotation.z=-.16+Math.sin(elapsed*1.9+index)*.1;
      note.scale.setScalar(.72+progress*.26);
      note.traverse(node=>{if(node.material?.transparent)node.material.opacity=opacity;});
    });
    if(!ending){setVisible(false);return;}
    invalidate();
  });
  return visible?<group>
    {[0,1,2].map(index=><group key={index} ref={node=>{notes.current[index]=node;}}>
      {index===0&&<><mesh position={[0,0,0]}><sphereGeometry args={[.055,10,8]}/><meshBasicMaterial color="#f1d28b" transparent depthWrite={false} toneMapped={false}/></mesh><mesh position={[.045,.125,0]}><boxGeometry args={[.028,.25,.028]}/><meshBasicMaterial color="#f1d28b" transparent depthWrite={false} toneMapped={false}/></mesh><mesh position={[.105,.235,0]} rotation={[0,0,-.36]}><boxGeometry args={[.12,.028,.028]}/><meshBasicMaterial color="#f1d28b" transparent depthWrite={false} toneMapped={false}/></mesh></>}
      {index===1&&<><mesh position={[0,0,0]} scale={[1.25,.8,1]}><sphereGeometry args={[.055,10,8]}/><meshBasicMaterial color="#a8d9cb" transparent depthWrite={false} toneMapped={false}/></mesh><mesh position={[.05,.15,0]}><boxGeometry args={[.028,.3,.028]}/><meshBasicMaterial color="#a8d9cb" transparent depthWrite={false} toneMapped={false}/></mesh></>}
      {index===2&&<><mesh position={[-.09,0,0]}><sphereGeometry args={[.05,10,8]}/><meshBasicMaterial color="#f1d28b" transparent depthWrite={false} toneMapped={false}/></mesh><mesh position={[.1,.025,0]}><sphereGeometry args={[.05,10,8]}/><meshBasicMaterial color="#f1d28b" transparent depthWrite={false} toneMapped={false}/></mesh><mesh position={[-.045,.135,0]}><boxGeometry args={[.026,.27,.028]}/><meshBasicMaterial color="#f1d28b" transparent depthWrite={false} toneMapped={false}/></mesh><mesh position={[.145,.16,0]}><boxGeometry args={[.026,.27,.028]}/><meshBasicMaterial color="#f1d28b" transparent depthWrite={false} toneMapped={false}/></mesh><mesh position={[.05,.285,0]} rotation={[0,0,.15]}><boxGeometry args={[.22,.03,.028]}/><meshBasicMaterial color="#f1d28b" transparent depthWrite={false} toneMapped={false}/></mesh></>}
    </group>)}
  </group>:null;
}

export default function Radio({ visible=true, keyboardFocused, registerRoomAction, onHover, onPlaybackChange }) {
  const audio = useRef(null);
  const fadeFrame = useRef(null);
  const hoverCallback = useRef(onHover);
  useEffect(()=>{hoverCallback.current=onHover;},[onHover]);
  const staticContext=useRef(null);
  const {invalidate}=useThree();
  const requested = useRef(false);
  const manuallyStopped = useRef(false);
  const [on, setOn] = useState(false);
  const [musicAnimationAllowed,setMusicAnimationAllowed]=useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(()=>{invalidate();},[on,invalidate]);
  useEffect(()=>{onPlaybackChange?.(on,musicAnimationAllowed);},[on,musicAnimationAllowed,onPlaybackChange]);
  const playStatic=useCallback(()=>{
    try {
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext)return;
      const context=staticContext.current||(staticContext.current=new AudioContext());
      const burst=()=>{
        if(staticContext.current!==context||context.state!=='running')return;
        const duration=.14,buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
        const samples=buffer.getChannelData(0);
        for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
        const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
        source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1400;filter.Q.value=.65;
        const now=context.currentTime;
        gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.042,now+.012);gain.gain.exponentialRampToValueAtTime(.0006,now+duration);
        source.connect(filter);filter.connect(gain);gain.connect(context.destination);
        source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
        source.start(now);source.stop(now+duration);
      };
      if(context.state==='running')burst();else context.resume().then(burst).catch(()=>{});
    } catch {} // An unavailable sound effect must not prevent music playback.
  },[]);
  useEffect(()=>()=>{const context=staticContext.current;staticContext.current=null;if(context&&context.state!=='closed')context.close().catch(()=>{});},[]);
  useEffect(() => {
    const player = new Audio('/audio/cozy-nordic-quiet-spot.m4a');
    player.preload = 'auto';
    player.loop = true;
    player.volume = RADIO_VOLUME;
    audio.current = player;
    const error = () => {
      requested.current = false; setOn(false); setFailed(true);
      hoverCallback.current('Radio · unable to play, tap to retry');
    };
    const playing=()=>{if(requested.current)setOn(true);};
    const stopped=()=>setOn(false);
    player.addEventListener('playing',playing);
    player.addEventListener('pause',stopped);
    player.addEventListener('waiting',stopped);
    player.addEventListener('ended',stopped);
    player.addEventListener('error', error);
    requested.current = visible;
    // Try on landing; browsers that block autoplay retry on the first interaction.
    const start = () => {
      if (!requested.current || audio.current !== player || !player.paused) return;
      player.play().catch(cause => {
        if (audio.current !== player || !requested.current) return;
        if (cause.name !== 'NotAllowedError' && cause.name !== 'AbortError') error();
      });
    };
    document.addEventListener('pointerdown', start);
    document.addEventListener('keydown', start);
    if(visible)start();
    return () => {
      requested.current = false;
      document.removeEventListener('pointerdown', start);
      document.removeEventListener('keydown', start);
      player.removeEventListener('playing',playing);
      player.removeEventListener('pause',stopped);
      player.removeEventListener('waiting',stopped);
      player.removeEventListener('ended',stopped);
      player.removeEventListener('error', error);
      player.pause(); player.removeAttribute('src'); player.load();
      audio.current = null;
    };
  // Own the player for the mounted radio's lifetime, not the hover callback's lifetime.
  }, []);
  useEffect(() => {
    const player=audio.current;
    cancelAnimationFrame(fadeFrame.current);
    if(!player)return;
    if(visible){player.volume=RADIO_VOLUME;return;}
    if(player.paused){requested.current=false;setOn(false);player.volume=RADIO_VOLUME;return;}
    const started=performance.now(),startVolume=player.volume;
    const fade=now=>{
      const progress=Math.min(1,(now-started)/520);
      player.volume=startVolume*(1-progress);
      if(progress<1){fadeFrame.current=requestAnimationFrame(fade);return;}
      requested.current=false;player.pause();player.volume=RADIO_VOLUME;setOn(false);
    };
    fadeFrame.current=requestAnimationFrame(fade);
    return ()=>cancelAnimationFrame(fadeFrame.current);
  },[visible]);
  const toggle = useCallback(event => {
    event?.stopPropagation();
    if ((event?.delta ?? 0) > 5 || !audio.current) return;
    const player = audio.current;
    playStatic();
    if (requested.current) {
      manuallyStopped.current = true;
      requested.current = false; player.pause(); setOn(false);
      onHover('Radio · play music');
      return;
    }
    // Landing playback stays separate from the mascot until an off/on cycle.
    setMusicAnimationAllowed(manuallyStopped.current);
    if (failed) player.load();
    requested.current = true; setFailed(false);
    onHover('Radio · turn music off');
    // Start within the tap/click gesture so mobile browsers allow audio playback.
    player.play().catch(() => {
      if (!requested.current || audio.current !== player) return;
      requested.current = false; setOn(false); setFailed(true);
      onHover('Radio · unable to play, tap to retry');
    });
  },[failed,onHover,playStatic]);
  useEffect(()=>visible ? registerRoomAction?.('radio',()=>toggle()) : undefined,[visible,registerRoomAction,toggle]);
  useTrackedState({radio:on});
  const { scene } = useLoader(GLTFLoader, '/models/radio/optimized.gltf');
  const model = useMemo(() => {
    const clone = scene.clone(true);
    // The antenna shares the body mesh; its long wall shadow resembles a stray pole.
    clone.traverse(node => { if(node.isMesh) { node.castShadow=false; node.receiveShadow=true; } });
    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const scale = 1.3 / bounds.getSize(new Vector3()).x;
    clone.scale.multiplyScalar(scale);
    clone.position.set(-center.x*scale, -bounds.min.y*scale, -center.z*scale);
    return clone;
  }, [scene]);
  return <InteractiveObject focused={keyboardFocused} label={failed ? 'Radio · tap to retry' : on ? 'Radio · turn music off' : 'Radio · play music'} onHover={onHover}>
    <group visible={visible} position={[-3.65,-1.49,1.05]} rotation={[0,.12,0]} onClick={toggle}><primitive object={model}/>
      <mesh position={[.44,.6,.237]}><sphereGeometry args={[.029,12,8]}/><meshStandardMaterial color="#212921" roughness={.7}/></mesh>
      <mesh position={[.44,.6,.258]}><sphereGeometry args={[.018,12,8]}/><meshStandardMaterial color={on?'#b9ef89':'#40513b'} emissive="#8ee65c" emissiveIntensity={on?2.5:0} toneMapped={false}/></mesh>
      <MusicNotes playing={on}/>
    </group>
  </InteractiveObject>;
}
