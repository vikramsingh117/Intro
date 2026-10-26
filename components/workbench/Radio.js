import { RADIO_VOLUME, takeRadioEntrance } from './radioEntrance';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box3, Vector3 } from 'three';
import InteractiveObject from './InteractiveObject';

export default function Radio({ onHover }) {
  const audio = useRef(null);
  const entranceSession=useRef(null);
  const staticContext=useRef(null);
  const {invalidate}=useThree();
  const requested = useRef(false);
  const [on, setOn] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(()=>{invalidate();},[on,invalidate]);
  const playStatic=()=>{
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
        gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.07,now+.012);gain.gain.exponentialRampToValueAtTime(.001,now+duration);
        source.connect(filter);filter.connect(gain);gain.connect(context.destination);
        source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
        source.start(now);source.stop(now+duration);
      };
      if(context.state==='running')burst();else context.resume().then(burst).catch(()=>{});
    } catch {} // An unavailable sound effect must not prevent music playback.
  };
  useEffect(()=>()=>{const context=staticContext.current;staticContext.current=null;if(context&&context.state!=='closed')context.close().catch(()=>{});},[]);
  useEffect(() => {
    const entrance=takeRadioEntrance();
    entranceSession.current=entrance;
    const player = entrance?.player || new Audio('/audio/cozy-nordic-quiet-spot.m4a');
    player.preload = 'none';
    player.loop = true;
    if(!entrance)player.volume = RADIO_VOLUME;
    audio.current = player;
    const error = () => {
      requested.current = false; setOn(false); setFailed(true);
      onHover('Radio · unable to play, tap to retry');
    };
    const playing=()=>{if(requested.current)setOn(true);};
    player.addEventListener('playing',playing);
    player.addEventListener('error', error);
    let mounted=true;
    if(entrance){
      requested.current=true;
      entrance.fadeIn().then(started=>{if(!mounted)return;requested.current=started;setOn(started);});
    }
    return () => {
      mounted=false;
      requested.current = false;
      player.removeEventListener('playing',playing);
      player.removeEventListener('error', error);
      player.pause(); player.removeAttribute('src'); player.load();
      entrance?.dispose();entranceSession.current=null;
      audio.current = null;
    };
  }, [onHover]);
  const toggle = event => {
    event.stopPropagation();
    if (event.delta > 5 || !audio.current) return;
    const player = audio.current;
    playStatic();
    if (requested.current) {
      requested.current = false; player.pause(); setOn(false);
      onHover('Radio · play music');
      return;
    }
    entranceSession.current?.normalVolume();
    if (failed) player.load();
    requested.current = true; setFailed(false);
    onHover('Radio · turn music off');
    // Start within the tap/click gesture so mobile browsers allow audio playback.
    player.play().catch(() => {
      if (!requested.current || audio.current !== player) return;
      requested.current = false; setOn(false); setFailed(true);
      onHover('Radio · unable to play, tap to retry');
    });
  };
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
  return <InteractiveObject label={failed ? 'Radio · tap to retry' : on ? 'Radio · turn music off' : 'Radio · play music'} onHover={onHover}>
    <group position={[-3.65,-1.49,1.05]} rotation={[0,.12,0]} onClick={toggle}><primitive object={model}/>
      <mesh position={[.44,.6,.237]}><sphereGeometry args={[.029,12,8]}/><meshStandardMaterial color="#212921" roughness={.7}/></mesh>
      <mesh position={[.44,.6,.258]}><sphereGeometry args={[.018,12,8]}/><meshStandardMaterial color={on?'#b9ef89':'#40513b'} emissive="#8ee65c" emissiveIntensity={on?2.5:0} toneMapped={false}/></mesh>
    </group>
  </InteractiveObject>;
}
