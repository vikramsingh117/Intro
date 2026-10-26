import { useAfterHoursTransition } from '../AfterHoursTransition';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import CityExterior, { NightEffects } from './CityExterior';
import Notebook, { NOTEBOOK_TARGET } from './Notebook';
import InteractiveObject from './InteractiveObject';
import NoteProjection from './NoteProjection';
import StickyNotes from './StickyNotes';
import CozyRoom from './CozyRoom';
import DeskLamp from './DeskLamp';
import FlyingPlane from './FlyingPlane';
import Radio from './Radio';
import CeilingLight from './CeilingLight';
import Plant from './Plant';
import Pascal from './Pascal';
import Stool from './Stool';
import Upliance from './Upliance';
import Chair from './Chair';
import Keyboard from './Keyboard';
import { ACESFilmicToneMapping, Euler, Quaternion, Matrix4, SRGBColorSpace, TextureLoader, TOUCH, Vector3 } from 'three';

function FirstRoomFrame({ onReady }) {
  const frames = useRef(0);
  const invalidate = useThree(state => state.invalidate);
  useFrame(() => {
    if (frames.current >= 4) return;
    frames.current += 1;
    if (frames.current === 4) onReady();
    else invalidate();
  });
  return null;
}

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
    // Keep touch UI inside the visible part of the physical monitor in portrait.
    const focusDistance = Math.min(1.16, 1.88 / (size.width / size.height)) / Math.tan(21 * Math.PI / 180) * 1.3;
    const pixelScale = size.height * 3.76 / (2 * focusDistance * Math.tan(21 * Math.PI / 180) * 1280);
    desktopRef.current.style.setProperty('--mobile-desktop-width', `${Math.min(1280, size.width / pixelScale - 24)}px`);
    desktopRef.current.style.setProperty('--mobile-touch', `${Math.max(48, 44 / pixelScale)}px`);
    desktopRef.current.style.setProperty('--mobile-font', `${Math.max(20, 16 / pixelScale)}px`);
  });
  const { scene } = useLoader(GLTFLoader, '/models/monitor.glb');
  useEffect(() => { scene.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } }); }, [scene]);
  const wallpaper = useLoader(TextureLoader, '/images/workbench-wallpaper.svg');
  wallpaper.colorSpace = SRGBColorSpace;
  return <group position={[1.5, 0, 0]} rotation={[0, Math.PI, 0]} scale={10} onClick={event => { event.stopPropagation(); if (event.delta <= 5) onEnter(); }}>
    <group position={[.196344, -.15, 0]}>
      <primitive object={scene} />
      <mesh ref={screen} position={[-.196344, .17128, .051]} rotation={[Math.PI + .139626, 0, Math.PI]}>
        <planeGeometry args={[.376, .232]} /><meshBasicMaterial key={size.width <= 760 ? 'plain' : 'wallpaper'} map={size.width <= 760 ? null : wallpaper} color={size.width <= 760 ? '#172536' : '#ffffff'} toneMapped={false} />
      </mesh>
    </group>
  </group>;
}
function Camera({ upliance, onUplianceArrive, entered, outside, notebook, citySettings, reduced, onArrive, interactionBlocked, noteMode, noteX, noteY }) {
  const { camera, gl, size, invalidate } = useThree();
  const { cameraX, cameraY, cameraZ, targetX, targetY, targetZ, fov } = citySettings;
  const transition = useRef(null);
  const orbit = useRef(null);
  const roomPosition = useRef(null);
  const wasFocused = useRef(false);
  const windowLook = useRef({center:null,yaw:0,pitch:0,drag:null});
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.target.set(0, .2128, -.51);
    controls.enablePan = false;
    controls.touches.ONE = TOUCH.ROTATE;
    controls.touches.TWO = TOUCH.DOLLY_PAN;
    gl.domElement.style.touchAction = 'none';
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
  useEffect(() => {
    if(orbit.current) orbit.current.enabled = !interactionBlocked && !entered && !outside && !notebook && !upliance && !!transition.current?.done;
  }, [interactionBlocked, entered, outside, notebook, upliance]);
  const lookTarget = useRef(new Vector3(0, .2128, -.51));
  useEffect(() => {
    const element=gl.domElement, look=windowLook.current;
    look.center=null;look.drag=null;look.yaw=0;look.pitch=0;
    if(!outside)return;
    const rotation=new Quaternion(), angles=new Euler(0,0,0,'YXZ');
    const down=event=>{
      if(event.button!==0 || !transition.current?.done || !look.center)return;
      look.drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:look.yaw,pitch:look.pitch};
      element.setPointerCapture(event.pointerId);
    };
    const move=event=>{
      if(!look.drag || look.drag.id!==event.pointerId)return;
      look.yaw=Math.max(-.21,Math.min(.21,look.drag.yaw-(event.clientX-look.drag.x)*.002));
      look.pitch=Math.max(-.14,Math.min(.14,look.drag.pitch-(event.clientY-look.drag.y)*.002));
      rotation.setFromEuler(angles.set(look.pitch,look.yaw,0,'YXZ'));
      camera.quaternion.copy(look.center).multiply(rotation);
      camera.getWorldDirection(lookTarget.current).multiplyScalar(12).add(camera.position);
      invalidate();
    };
    const up=event=>{
      if(look.drag?.id!==event.pointerId)return;
      look.drag=null;
      if(element.hasPointerCapture(event.pointerId))element.releasePointerCapture(event.pointerId);
    };
    element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);
    element.addEventListener('pointerup',up);element.addEventListener('pointercancel',up);
    return ()=>{
      if(look.drag && element.hasPointerCapture(look.drag.id))element.releasePointerCapture(look.drag.id);
      look.drag=null;
      element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);
      element.removeEventListener('pointerup',up);element.removeEventListener('pointercancel',up);
    };
  }, [outside,camera,gl,invalidate]);
  const callback = useRef(onArrive);
  callback.current = onArrive;
  const applianceCallback=useRef(onUplianceArrive);
  applianceCallback.current=onUplianceArrive;
  useEffect(() => {
    const focused = entered || outside || notebook || !!upliance || !!noteMode;
    if (focused && !wasFocused.current) roomPosition.current = camera.position.clone();
    wasFocused.current = focused;
    if (orbit.current) {
      orbit.current.enabled = false;
      orbit.current.maxDistance = Math.max(18, 12 / (size.width / size.height));
      orbit.current.minAzimuthAngle = size.width <= 760 ? -.75 : -.2;
      orbit.current.maxAzimuthAngle = size.width <= 760 ? 1.15 : .65;
    }
    // Approach perpendicular to the screen until its surface covers the viewport.
    const distance = Math.min(1.16, 1.88 / (size.width / size.height)) / Math.tan(21 * Math.PI / 180) * 1.3;
    // Fill the viewport with the open spread, seen almost straight down.
    const notebookDistance = Math.max(.82, 1.15 / (size.width / size.height)) / Math.tan(21 * Math.PI / 180) * 1.2;
    const notebookCamera = new Vector3(...NOTEBOOK_TARGET).add(new Vector3(0, .96, .28).multiplyScalar(notebookDistance));
    const noteDistance = Math.max(.43, .43/(size.width/size.height))/Math.tan(21*Math.PI/180)*1.2;
    const noteTarget = noteMode==='wall' ? new Vector3(1.875,2.8,-3.075) : noteMode==='read' ? new Vector3(noteX,noteY,-3.075) : new Vector3(3.7,-1.397,.8);
    const noteCamera = noteMode==='wall'
      ? noteTarget.clone().add(new Vector3(0,0,Math.max(2.5,4.9/(size.width/size.height))/Math.tan(21*Math.PI/180)))
      : noteTarget.clone().add(noteMode==='read'?new Vector3(0,0,noteDistance):new Vector3(0,.995,.1).multiplyScalar(noteDistance));
    const applianceTarget=upliance ? new Vector3(...upliance.target) : null;
    const applianceDistance=upliance ? Math.max(upliance.height/2,upliance.width/2/(size.width/size.height))/Math.tan(21*Math.PI/180)*1.35 : 0;
    const applianceCamera=upliance ? applianceTarget.clone().add(new Vector3(...upliance.normal).multiplyScalar(applianceDistance)) : null;
    transition.current = { from:camera.position.clone(), fovFrom:camera.fov, fovTo:outside ? fov : 42, lookFrom:lookTarget.current.clone(), lookTo:upliance ? applianceTarget : noteMode ? noteTarget : notebook ? new Vector3(...NOTEBOOK_TARGET) : outside ? new Vector3(targetX,targetY,targetZ) : new Vector3(entered ? 1.5 : 0, .2128, -.51), to:upliance ? applianceCamera : noteMode ? noteCamera : notebook ? notebookCamera : outside ? new Vector3(cameraX,cameraY,cameraZ) : entered ? new Vector3(1.5, .2128 + .139173 * distance, -.51 + .990268 * distance)  : (roomPosition.current?.clone() || new Vector3(6, 3.5, Math.max(14.8, 10 / (size.width / size.height)))), elapsed:noteMode==='wall' && !reduced ? -.65 : 0, done:false };
    invalidate();
  }, [upliance, noteMode, noteX, noteY, entered, outside, notebook, cameraX, cameraY, cameraZ, targetX, targetY, targetZ, fov, reduced, camera, size.width, size.height, invalidate]);
  useFrame((state, dt) => {
    const t = transition.current;
    if (!t || t.done) return;
    t.elapsed += Math.min(dt, .05);
    const progress = reduced ? 1 : Math.max(0, Math.min(1, t.elapsed / 1.45));
    const ease = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    camera.position.lerpVectors(t.from, t.to, ease);
    lookTarget.current.lerpVectors(t.lookFrom, t.lookTo, ease);
    camera.lookAt(lookTarget.current);
    camera.fov = t.fovFrom + (t.fovTo - t.fovFrom) * ease;
    camera.updateProjectionMatrix();
    if (progress < 1) state.invalidate();
    else {
      t.done = true;
      if(upliance)applianceCallback.current?.();
      if(outside) {
        windowLook.current.center=camera.quaternion.clone();
        windowLook.current.yaw=0;windowLook.current.pitch=0;
      }
      if (!entered && !outside && !notebook && !upliance && !noteMode && orbit.current) {
        orbit.current.target.copy(lookTarget.current);
        orbit.current.enabled = !interactionBlocked;
        orbit.current.update();
      }
      if (entered && !outside) callback.current();
    }
  }, -1);
  return null;
}
export default function MonitorScene({ upliance, upliancePage, uplianceControlsRef, onUplianceArrive, onUplianceSelect, propPlacement, entered, reduced, onEnter, onArrive, lampOn, onLampToggle, onWindowSelect, outside, onCityReady, desktopRef, desktop, notebook, notebookPage, onNotebookOpen, onHover, notebookOpen, onNotebookPageChange, onNotebookExit, citySettings, wearingGlasses, onWearGlasses, stickyNotes, noteEditorRef }) {
  const { sceneReady } = useAfterHoursTransition();
  return <Canvas onPointerMissed={()=>{if(notebook)onNotebookExit();}} shadows camera={{ position:[6, 3.5, 14.8], fov:42 }} dpr={[1, 1.5]} frameloop="demand" gl={{alpha:true, antialias:true, toneMapping:ACESFilmicToneMapping, toneMappingExposure:.85}}>
    <FirstRoomFrame onReady={sceneReady}/>
    <color attach="background" args={['#091321']} />
    <group onClick={event=>{if(notebook && event.delta<=5){event.stopPropagation();onNotebookExit();}}}>
    <NightEffects exposure={outside ? citySettings.exposure : .85} glow={outside ? citySettings.glow : .55} />
    <Suspense fallback={null}><CityExterior onReady={onCityReady} settings={citySettings} /></Suspense>
    <Suspense fallback={null}><FlyingPlane active={outside} reduced={reduced} settings={citySettings}/></Suspense>
    <hemisphereLight args={['#c8d4d0', '#494237', outside ? citySettings.ambient : .65]} />
    <directionalLight position={[3, 5, 4]} intensity={.8} color="#c7d5df" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-normalBias={.04} />
    <pointLight position={[-4.6, 2, -2.5]} intensity={18} distance={12} decay={2} color="#8abbd9" />
    <Suspense fallback={null}><InteractiveObject label="Monitor · explore my work" onHover={onHover}><Monitor onEnter={notebook ? onNotebookExit : onEnter} desktopRef={desktopRef} desktop={desktop} /></InteractiveObject></Suspense>
    <Camera {...{upliance,onUplianceArrive,entered,outside,notebook,citySettings,reduced,onArrive}} noteMode={stickyNotes.editor ? (stickyNotes.editor.id?'read':'write') : stickyNotes.placing?'wall':null} noteX={stickyNotes.editor?.x} noteY={stickyNotes.editor?.y} interactionBlocked={stickyNotes.dragging || !!stickyNotes.editor || !!stickyNotes.placing}/>
    <StickyNotes api={stickyNotes} onHover={onHover} reduced={reduced}/>
    {stickyNotes.editor && <NoteProjection editor={stickyNotes.editor} elementRef={noteEditorRef}/>}
    <Suspense fallback={null}><Chair/></Suspense>
    <Suspense fallback={null}><Plant/></Suspense>
    <Suspense fallback={null}><Stool placement={propPlacement?.stool}/></Suspense>
    <Suspense fallback={null}><Pascal placement={propPlacement?.pascal}/></Suspense>
    <Suspense fallback={null}><Upliance controlsRef={uplianceControlsRef} focused={!!upliance} workPage={upliancePage} onSelect={onUplianceSelect} placement={propPlacement?.upliance} reduced={reduced} interactive={!entered && !outside && !notebook && !upliance && !stickyNotes.editor && !stickyNotes.placing} onHover={onHover}/></Suspense>
    <Suspense fallback={null}><CeilingLight onHover={onHover}/></Suspense>
    <CozyRoom reduced={reduced} wearingGlasses={wearingGlasses} onWearGlasses={onWearGlasses} onWindowSelect={notebook ? onNotebookExit : onWindowSelect} onHover={onHover} />
    <InteractiveObject label="Notebook · ideas & sketches" onHover={onHover}><Notebook focused={notebook} open={notebookOpen} onPageChange={onNotebookPageChange} page={notebookPage} reduced={reduced} onOpen={onNotebookOpen} /></InteractiveObject>
    <Suspense fallback={null}><Keyboard /></Suspense>
    <Suspense fallback={null}><Radio onHover={onHover}/></Suspense>
    <Suspense fallback={null}><InteractiveObject label={lampOn ? "Lamp · turn off" : "Lamp · turn on"} onHover={onHover}><DeskLamp on={lampOn} onToggle={notebook ? onNotebookExit : onLampToggle} /></InteractiveObject></Suspense>
    <pointLight position={[1.5,.15,.1]} color="#9cc8df" intensity={3} distance={5} />
    </group>
  </Canvas>;
}
