import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import SubwayExterior, { NightEffects, SUBWAY_CENTER, WINDOW_CAMERA } from './SubwayView';
import Notebook, { NOTEBOOK_TARGET } from './Notebook';
import InteractiveObject from './InteractiveObject';
import CozyRoom from './CozyRoom';
import DeskLamp from './DeskLamp';
import Keyboard from './Keyboard';
import { ACESFilmicToneMapping, Matrix4, SRGBColorSpace, TextureLoader, Vector3 } from 'three';

function Monitor({ onEnter, desktopRef, desktop }) {
  const screen = useRef(null);
  const { camera, size, invalidate } = useThree();
  const projection = useMemo(() => new Matrix4(), []);
  useEffect(() => { invalidate(); }, [desktop, invalidate]);
  useFrame(() => {
    if (!screen.current || !desktopRef.current) return;
    screen.current.updateWorldMatrix(true, false);
    camera.updateMatrixWorld();
    // Project the HTML desktop onto the exact monitor plane, including perspective.
    const pixelsToScreen = new Matrix4().set(
      .376 / 1280, 0, 0, -.188,
      0, -.232 / 780, 0, .116,
      0, 0, 1, .0001,
      0, 0, 0, 1
    );
    const viewport = new Matrix4().set(
      size.width / 2, 0, 0, size.width / 2,
      0, -size.height / 2, 0, size.height / 2,
      0, 0, 0, 0,
      0, 0, 0, 1
    );
    projection.copy(viewport).multiply(camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(screen.current.matrixWorld).multiply(pixelsToScreen);
    // Keep the CSS matrix invertible so browser hit-testing reaches desktop controls.
    projection.elements[10] = 1;
    desktopRef.current.style.transform = `matrix3d(${projection.elements.join(',')})`;
    desktopRef.current.style.visibility = 'visible';
  });
  const { scene } = useLoader(GLTFLoader, '/models/monitor.glb');
  useEffect(() => { scene.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } }); }, [scene]);
  const wallpaper = useLoader(TextureLoader, '/images/workbench-wallpaper.svg');
  wallpaper.colorSpace = SRGBColorSpace;
  return <group position={[1.5, 0, 0]} rotation={[0, Math.PI, 0]} scale={10} onClick={event => { event.stopPropagation(); if (event.delta <= 5) onEnter(); }}>
    <group position={[.196344, -.15, 0]}>
      <primitive object={scene} />
      <mesh ref={screen} position={[-.196344, .17128, .051]} rotation={[Math.PI + .139626, 0, Math.PI]}>
        <planeGeometry args={[.376, .232]} /><meshBasicMaterial map={wallpaper} toneMapped={false} />
      </mesh>
    </group>
  </group>;
}
function Camera({ entered, outside, notebook, reduced, onArrive }) {
  const { camera, gl, size, invalidate } = useThree();
  const transition = useRef(null);
  const orbit = useRef(null);
  const roomPosition = useRef(null);
  const wasFocused = useRef(false);
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.target.set(0, .2128, -.51);
    controls.enablePan = false;
    controls.touches.ONE = null;
    controls.touches.TWO = null;
    gl.domElement.style.touchAction = 'pan-y';
    controls.enableDamping = false;
    controls.minDistance = 6;
    controls.minAzimuthAngle = -.2;
    controls.maxAzimuthAngle = .65;
    controls.minPolarAngle = .9;
    controls.maxPolarAngle = 1.5;
    controls.rotateSpeed = .55;
    controls.zoomSpeed = .7;
    controls.enabled = false;
    controls.addEventListener('change', invalidate);
    orbit.current = controls;
    return () => { controls.removeEventListener('change', invalidate); controls.dispose(); orbit.current = null; };
  }, [camera, gl, invalidate]);
  const lookTarget = useRef(new Vector3(0, .2128, -.51));
  const callback = useRef(onArrive);
  callback.current = onArrive;
  useEffect(() => {
    const focused = entered || outside || notebook;
    if (focused && !wasFocused.current) roomPosition.current = camera.position.clone();
    wasFocused.current = focused;
    if (orbit.current) {
      orbit.current.enabled = false;
      orbit.current.maxDistance = Math.max(18, 12 / (size.width / size.height));
    }
    // Approach perpendicular to the screen until its surface covers the viewport.
    const distance = Math.min(1.16, 1.88 / (size.width / size.height)) / Math.tan(21 * Math.PI / 180) * 1.3;
    // Fill the viewport with the open spread, seen almost straight down.
    const notebookDistance = Math.max(.82, 1.15 / (size.width / size.height)) / Math.tan(21 * Math.PI / 180) * 1.2;
    const notebookCamera = new Vector3(...NOTEBOOK_TARGET).add(new Vector3(0, .96, .28).multiplyScalar(notebookDistance));
    transition.current = { from:camera.position.clone(), fovFrom:camera.fov, fovTo:outside ? 45 : 42, lookFrom:lookTarget.current.clone(), lookTo:notebook ? new Vector3(...NOTEBOOK_TARGET) : outside ? new Vector3(...SUBWAY_CENTER) : new Vector3(entered ? 1.5 : 0, .2128, -.51), to:notebook ? notebookCamera : outside ? new Vector3(...WINDOW_CAMERA) : entered ? new Vector3(1.5, .2128 + .139173 * distance, -.51 + .990268 * distance) : (roomPosition.current?.clone() || new Vector3(5.5, 3.1, Math.max(11.8, 9 / (size.width / size.height)))), elapsed:0, done:false };
    invalidate();
  }, [entered, outside, notebook, reduced, camera, size.width, size.height, invalidate]);
  useFrame((state, dt) => {
    const t = transition.current;
    if (!t || t.done) return;
    t.elapsed += Math.min(dt, .05);
    const progress = reduced ? 1 : Math.min(1, t.elapsed / 1.45);
    const ease = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    camera.position.lerpVectors(t.from, t.to, ease);
    lookTarget.current.lerpVectors(t.lookFrom, t.lookTo, ease);
    camera.lookAt(lookTarget.current);
    camera.fov = t.fovFrom + (t.fovTo - t.fovFrom) * ease;
    camera.updateProjectionMatrix();
    if (progress < 1) state.invalidate();
    else {
      t.done = true;
      if (!entered && !outside && !notebook && orbit.current) {
        orbit.current.target.copy(lookTarget.current);
        orbit.current.enabled = true;
        orbit.current.update();
      }
      if (entered && !outside) callback.current();
    }
  }, -1);
  return null;
}
export default function MonitorScene({ entered, reduced, onEnter, onArrive, lampOn, onLampToggle, onWindowSelect, outside, onSubwayReady, desktopRef, desktop, lighting, notebook, notebookPage, onNotebookOpen, onHover, notebookOpen, onNotebookPageChange, onNotebookExit }) {
  return <Canvas onPointerMissed={()=>{if(notebook)onNotebookExit();}} shadows camera={{ position:[5.5, 3.1, 11.8], fov:42 }} dpr={[1, 1.5]} frameloop="demand" gl={{alpha:true, antialias:true, toneMapping:ACESFilmicToneMapping, toneMappingExposure:.85}}>
    <color attach="background" args={['#091321']} />
    <group onClick={event=>{if(notebook && event.delta<=5){event.stopPropagation();onNotebookExit();}}}>
    <NightEffects exposure={outside ? lighting.exposure : .85} glow={outside ? lighting.glow : .55} />
    <Suspense fallback={null}><SubwayExterior onReady={onSubwayReady} lighting={lighting} /></Suspense>
    <hemisphereLight args={['#c8d4d0', '#494237', outside ? lighting.ambient : .65]} />
    <directionalLight position={[3, 5, 4]} intensity={.8} color="#c7d5df" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-normalBias={.04} />
    <pointLight position={[-4.6, 2, -2.5]} intensity={18} distance={12} decay={2} color="#8abbd9" />
    <Suspense fallback={null}><InteractiveObject label="Monitor · explore my work" onHover={onHover}><Monitor onEnter={notebook ? onNotebookExit : onEnter} desktopRef={desktopRef} desktop={desktop} /></InteractiveObject></Suspense>
    <Camera {...{entered,outside,notebook,reduced,onArrive}} />
    <CozyRoom onWindowSelect={notebook ? onNotebookExit : onWindowSelect} onHover={onHover} />
    <InteractiveObject label="Notebook · ideas & sketches" onHover={onHover}><Notebook focused={notebook} open={notebookOpen} onPageChange={onNotebookPageChange} page={notebookPage} reduced={reduced} onOpen={onNotebookOpen} /></InteractiveObject>
    <Suspense fallback={null}><Keyboard /></Suspense>
    <Suspense fallback={null}><InteractiveObject label={lampOn ? "Lamp · turn off" : "Lamp · turn on"} onHover={onHover}><DeskLamp on={lampOn} onToggle={notebook ? onNotebookExit : onLampToggle} /></InteractiveObject></Suspense>
    <pointLight position={[1.5,.15,.1]} color="#9cc8df" intensity={3} distance={5} />
    </group>
  </Canvas>;
}
