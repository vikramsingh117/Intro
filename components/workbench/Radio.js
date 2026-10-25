import { useEffect, useMemo, useRef, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box3, Vector3 } from 'three';
import InteractiveObject from './InteractiveObject';

export default function Radio({ onHover }) {
  const audio = useRef(null);
  const requested = useRef(false);
  const [on, setOn] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const player = new Audio('/audio/cozy-nordic-quiet-spot.m4a');
    player.preload = 'none';
    player.loop = true;
    player.volume = .4;
    audio.current = player;
    const error = () => {
      requested.current = false; setOn(false); setFailed(true);
      onHover('Radio · unable to play, tap to retry');
    };
    player.addEventListener('error', error);
    return () => {
      requested.current = false;
      player.removeEventListener('error', error);
      player.pause(); player.removeAttribute('src'); player.load();
      audio.current = null;
    };
  }, [onHover]);
  const toggle = event => {
    event.stopPropagation();
    if (event.delta > 5 || !audio.current) return;
    const player = audio.current;
    if (requested.current) {
      requested.current = false; player.pause(); setOn(false);
      onHover('Radio · play music');
      return;
    }
    if (failed) player.load();
    requested.current = true; setFailed(false); setOn(true);
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
    <group position={[-3.65,-1.49,1.05]} rotation={[0,.12,0]} onClick={toggle}><primitive object={model}/></group>
  </InteractiveObject>;
}
