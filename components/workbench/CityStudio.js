import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import CityExterior, { NightEffects } from './CityExterior';
import CityControls from './CityControls';
import { DEFAULT_CITY_SETTINGS } from './citySettings';
import styles from '../../styles/CityStudio.module.css';

function View({ settings, orbit }) {
  const { camera, gl, invalidate } = useThree();
  const { cameraX, cameraY, cameraZ, targetX, targetY, targetZ, fov } = settings;
  useEffect(() => {
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.fov = fov;
    camera.lookAt(targetX, targetY, targetZ);
    camera.updateProjectionMatrix();
    invalidate();
    if (!orbit) return;
    const controls = new OrbitControls(camera, gl.domElement);
    controls.target.set(targetX, targetY, targetZ);
    controls.minDistance = 1;
    controls.maxDistance = 150;
    controls.addEventListener('change', invalidate);
    controls.update();
    return () => { controls.removeEventListener('change', invalidate); controls.dispose(); };
  }, [camera, gl, invalidate, orbit, cameraX, cameraY, cameraZ, targetX, targetY, targetZ, fov]);
  return null;
}

export default function CityStudio() {
  const [settings, setSettings] = useState({ ...DEFAULT_CITY_SETTINGS });
  const [orbit, setOrbit] = useState(false);
  const [ready, setReady] = useState(false);
  return <div className={styles.studio}>
    <Canvas shadows frameloop="demand" dpr={[1, 1.5]} camera={{ near: .1, far: 300 }}
      gl={{ antialias: true, toneMapping: ACESFilmicToneMapping }}>
      <color attach="background" args={['#091321']} />
      <NightEffects exposure={settings.exposure} glow={settings.glow} />
      <hemisphereLight args={['#c8d4d0', '#494237', settings.ambient]} />
      <directionalLight position={[3, 5, 4]} intensity={.8} color="#c7d5df" />
      <Suspense fallback={null}><CityExterior settings={settings} onReady={setReady} /></Suspense>
      <View settings={settings} orbit={orbit} />
    </Canvas>
    <header className={styles.toolbar}>
      <Link href="/after-hours"><a>← Room</a></Link><strong>City workspace</strong>
      <button onClick={() => setOrbit(value => !value)}>{orbit ? 'Return to window camera' : 'Orbit city'}</button>
    </header>
    <p className={styles.hint}>{!ready ? 'Loading city…' : orbit ? 'Drag to orbit · scroll to zoom · right-drag to pan' : 'Window camera · adjust the clouds using the panel'}</p>
    <CityControls value={settings} onChange={setSettings} />
  </div>;
}
