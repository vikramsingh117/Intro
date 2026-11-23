// Composes the interactive Three.js room and coordinates its camera, objects, and readiness stages.
// It connects physical objects with ProductWorkbench state and exposes OrbitControls zoom through roomZoomBridge.
import { preloadAboutJourney } from './loadAboutJourney';
import { useAfterHoursTransition } from '../AfterHoursTransition';
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, events as createPointerEvents, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import CityExterior, { NightEffects } from './CityExterior';
import PhotoFrame, { PHOTO_TARGET } from './PhotoFrame';
import Notebook, { NOTEBOOK_TARGET } from './Notebook';
import PaperBalls from './PaperBalls';
import PaperPile from './PaperPile.js';
import BasketballHoop from './BasketballHoop';
import MonitorConfetti from './MonitorConfetti';
import PreloadAssets from './PreloadAssets';
import { isRoomHover } from './roomHover.mjs';
import StationaryShadows from './StationaryShadows';
import OptimisedFrames from './OptimisedFrames';
import InteractiveObject from './InteractiveObject';
import NoteProjection from './NoteProjection';
import StickyNotes from './StickyNotes';
import { NOTE_EDITOR_Z, NOTE_WALL_Z, noteBoundsForWidth, notePlacementRect } from './notePlacement.mjs';
import CozyRoom from './CozyRoom';
import DeskLamp from './DeskLamp';
import FlyingPlane from './FlyingPlane';
import Radio from './Radio';
import CeilingLight from './CeilingLight';
import Plant from './Plant';
import Fireflies from './Fireflies';
import Pascal from './Pascal';
import Stool from './Stool';
import Upliance from './Upliance';
import Chair from './Chair';
import Keyboard from './Keyboard';
import WorkBuildBoard, { WORK_BOARD_TARGET } from './WorkBuildBoard';
import { DEFAULT_ROOM_YEAR, roomHasObject } from './roomYears.mjs';
import { distanceForZoomProgress, roomZoomBridge, ROOM_FOCUS_PROGRESS, ROOM_MAX_DISTANCE, ROOM_MIN_DISTANCE, zoomMultiplier, zoomProgressForDistance } from './cameraZoom.mjs';
import { ACESFilmicToneMapping, Box3, Euler, Quaternion, Matrix4, SRGBColorSpace, TextureLoader, TOUCH, Vector3 } from 'three';

const ROOM_ATMOSPHERE={
  '2021':{background:'#8faea8',sky:'#dce9dc',ground:'#76644e',ambient:.92,directional:1.15,directionalColor:'#fff0cd',windowLight:8,windowColor:'#d8eff0',exposure:1},
  '2025':{background:'#354e54',sky:'#aabfc0',ground:'#4c5048',ambient:.68,directional:.7,directionalColor:'#c5d6d8',windowLight:11,windowColor:'#9ec7cf',exposure:.88},
  '2026':{background:'#091321',sky:'#c8d4d0',ground:'#494237',ambient:.65,directional:.8,directionalColor:'#c7d5df',windowLight:18,windowColor:'#8abbd9',exposure:.85},
};

// Reports a rolling render rate twice per second without adding another render loop.
function FpsMeter() {
  const sample = useRef({ frames:0, startedAt:0 });
  const slowStartDetected = useRef(false);
  useFrame(state => {
    const now = state.clock.elapsedTime;
    if (!sample.current.startedAt) sample.current.startedAt = now;
    sample.current.frames += 1;
    const elapsed = now - sample.current.startedAt;
    if (elapsed < .5) return;
    const fps = Math.round(sample.current.frames / elapsed);
    if (now <= 4 && fps < 20 && !slowStartDetected.current) {
      slowStartDetected.current = true;
      window.dispatchEvent(new CustomEvent('workbench:slow-start'));
    }
    const label = document.getElementById('fps-meter');
    const optimiseButton = document.getElementById('optimise-button');
    const performanceWarning = slowStartDetected.current || label?.dataset.performanceWarning === 'true';
    if (label) {
      label.textContent = `${fps} FPS`;
      label.setAttribute('aria-label', `Frame rate ${fps} frames per second`);
      label.dataset.performanceWarning = String(performanceWarning);
    }
    if (optimiseButton) optimiseButton.dataset.performanceWarning = String(performanceWarning);
    sample.current = { frames:0, startedAt:now };
  }, -2);
  return null;
}

function roomEvents(store) {
  const events = createPointerEvents(store);
  return { ...events, compute(event, state, previous) {
    state.raycaster.roomHoverOnly = isRoomHover(event, state.internal.capturedMap.size > 0);
    events.compute(event, state, previous);
  } };
}

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

function Monitor({ basketScore, reduced, onEnter, desktopRef, desktop, onReady }) {
  const screen = useRef(null);
  const { camera, size, invalidate } = useThree();
  const projection = useMemo(() => new Matrix4(), []);
  const lastProjection = useRef({ element: null, matrix: new Matrix4(), width: 0, height: 0 });
  const pixelsToScreen = useMemo(() => new Matrix4().set(
    .376 / 1280, 0, 0, -.188,
    0, -.232 / 780, 0, .116,
    0, 0, 1, .0001,
    0, 0, 0, 1
  ), []);
  const viewport = useMemo(() => new Matrix4(), []);
  const edgePoints = useMemo(() => [new Vector3(), new Vector3(), new Vector3()], []);
  useEffect(() => { invalidate(); }, [desktop, invalidate]);
  useFrame(() => {
    if (!screen.current || !desktopRef.current) return;
    screen.current.updateWorldMatrix(true, false);
    camera.updateMatrixWorld();
    // Project the HTML desktop onto the exact monitor plane, including perspective.
    viewport.set(
      size.width / 2, 0, 0, size.width / 2,
      0, -size.height / 2, 0, size.height / 2,
      0, 0, 0, 0,
      0, 0, 0, 1
    );
    projection.copy(viewport).multiply(camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(screen.current.matrixWorld).multiply(pixelsToScreen);
    // Keep the CSS matrix invertible so browser hit-testing reaches desktop controls.
    projection.elements[10] = 1;
    const previous = lastProjection.current;
    if (previous.element === desktopRef.current && previous.width === size.width && previous.height === size.height && previous.matrix.equals(projection)) return;
    previous.element = desktopRef.current;
    previous.width = size.width; previous.height = size.height;
    previous.matrix.copy(projection);
    desktopRef.current.style.transform = `matrix3d(${projection.elements.join(',')})`;
    desktopRef.current.style.visibility = 'visible';
    // The HTML screen sits above WebGL, so SMAA cannot smooth its outer boundary.
    // Feather only that boundary by about one display pixel, including during zoom.
    edgePoints[0].set(0, 0, 0).applyMatrix4(projection);
    edgePoints[1].set(1280, 0, 0).applyMatrix4(projection);
    edgePoints[2].set(0, 780, 0).applyMatrix4(projection);
    const edgeX = Math.min(12, Math.max(.5, 1280 / Math.max(1, edgePoints[0].distanceTo(edgePoints[1]))));
    const edgeY = Math.min(12, Math.max(.5, 780 / Math.max(1, edgePoints[0].distanceTo(edgePoints[2]))));
    desktopRef.current.style.setProperty('--screen-edge-x', `${edgeX}px`);
    desktopRef.current.style.setProperty('--screen-edge-y', `${edgeY}px`);
    // Keep touch UI inside the visible part of the physical monitor in portrait.
    const focusDistance = Math.min(1.16, 1.88 / (size.width / size.height)) / Math.tan(21 * Math.PI / 180) * 1.3;
    const pixelScale = size.height * 3.76 / (2 * focusDistance * Math.tan(21 * Math.PI / 180) * 1280);
    desktopRef.current.style.setProperty('--mobile-desktop-width', `${Math.min(1280, size.width / pixelScale - 24)}px`);
    desktopRef.current.style.setProperty('--mobile-touch', `${Math.max(48, 44 / pixelScale)}px`);
    desktopRef.current.style.setProperty('--mobile-font', `${Math.max(20, 16 / pixelScale)}px`);
  });
  const { scene } = useLoader(GLTFLoader, '/models/monitor.glb');
  useEffect(() => { scene.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } }); }, [scene]);
  const preview = useLoader(TextureLoader, '/images/workbench-about-pixel.svg');
  useEffect(() => { onReady(); }, [onReady]);
  preview.colorSpace = SRGBColorSpace;
  // Lens passes can only filter the WebGL texture, so use the static About Me preview for either radio state.
  const wallpaper = preview;
  return <group position={[1.5, 0, 0]} rotation={[0, Math.PI, 0]} scale={10} onClick={event => { event.stopPropagation(); if (event.delta <= 5) onEnter(); }}>
    <group position={[.196344, -.15, 0]}>
      <primitive object={scene} />
      <mesh ref={screen} position={[-.196344, .17128, .051]} rotation={[Math.PI + .139626, 0, Math.PI]}>
        <planeGeometry args={[.376, .232]} /><meshBasicMaterial map={wallpaper} toneMapped={false} />
        <MonitorConfetti score={basketScore} reduced={reduced}/>
      </mesh>
    </group>
  </group>;
}
// Original desk-centred viewing target.
const ROOM_TARGET = [0, .2128, -.51];
// Keep both orbit extremes inside the room at the 24-unit zoom-out limit.
const ROOM_MIN_AZIMUTH = -22 * Math.PI / 180;
const ROOM_MAX_AZIMUTH = 1.2;

function Camera({ paperOrbit, photo, workBoard, projectorState, pauseCamera, upliance, onUplianceArrive, entered, outside, onOutsideArrive, notebook, citySettings, reduced, onArrive, interactionBlocked, noteMode, noteX, noteY, notePlacement, roomResetKey }) {
  const { camera, gl, scene, size, invalidate } = useThree();
  const { cameraX, cameraY, cameraZ, targetX, targetY, targetZ, fov } = citySettings;
  const roomCameraZ=size.width<=760?Math.max(18.5,11.2/(size.width/size.height)):14.8;
  const roomHome = useMemo(() => {
    const target = new Vector3(...ROOM_TARGET);
    const offset = new Vector3(6,3.5,roomCameraZ).sub(target);
    // Keep the responsive starting view inside the chosen zoom-out limit.
    return target.add(offset.clampLength(0,22));
  }, [roomCameraZ]);
  const transition = useRef(null);
  const orbit = useRef(null);
  const emitZoom = useRef(() => {});
  const roomPosition = useRef(null);
  const appliedRoomReset = useRef(roomResetKey);
  const wasFocused = useRef(false);
  const zoomFocusArmed = useRef(true);
  const zoomFocusTarget = useRef(null);
  const zoomAimStart = useRef(null);
  const zoomReturn = useRef(null);
  const zoomSightReturn = useRef(null);
  const windowLook = useRef({center:null,yaw:0,pitch:0,drag:null});
  const initialRoomCamera=useRef(false);
  useLayoutEffect(()=>{
    if(initialRoomCamera.current)return;
    initialRoomCamera.current=true;
    const target = new Vector3(...ROOM_TARGET);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    camera.position.copy(reducedMotion ? roomHome : roomHome.clone().sub(target).setLength(24).add(target));
    camera.lookAt(...ROOM_TARGET);
    camera.updateProjectionMatrix();
    invalidate();
  },[camera,roomHome,invalidate]);
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.target.set(...ROOM_TARGET);
    controls.enablePan = false;
    controls.touches.ONE = TOUCH.ROTATE;
    controls.touches.TWO = TOUCH.DOLLY_PAN;
    gl.domElement.style.touchAction = 'none';
    controls.enableDamping = false;
    controls.dampingFactor = .12;
    controls.minDistance = ROOM_MIN_DISTANCE;
    controls.maxDistance = ROOM_MAX_DISTANCE;
    controls.minAzimuthAngle = ROOM_MIN_AZIMUTH;
    controls.maxAzimuthAngle = ROOM_MAX_AZIMUTH;
    controls.minPolarAngle = .75;
    controls.maxPolarAngle = 1.55;
    controls.rotateSpeed = .55;
    controls.zoomSpeed = .7;
    // Preserve the pointer ray while the object itself is pulled toward the
    // view centre, so trackpad zoom does not feel detached from the cursor.
    controls.zoomToCursor = true;
    controls.screenSpacePanning = true;
    controls.enabled = false;
    const homeDistance = roomHome.distanceTo(controls.target);
    const defaultTarget = new Vector3(...ROOM_TARGET);
    const focusBounds = new Box3();
    const focusCenter = new Vector3();
    let aimResetTimer = null;
    const interruptZoomReturn = () => {
      if (!zoomReturn.current) return false;
      zoomReturn.current = null;
      zoomAimStart.current = null;
      zoomFocusTarget.current = null;
      zoomFocusArmed.current = true;
      // The partially returned camera becomes the baseline for the next
      // gesture instead of forcing the visitor to wait for the old one.
      roomPosition.current = camera.position.clone();
      controls.enabled = true;
      controls.update();
      invalidate();
      return true;
    };
    const setCenteredCursor = active => {
      const bounds = gl.domElement.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent('room-zoom-cursor',{detail:{active,x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2}}));
    };
    const restoreUncommittedAim = () => {
      const start = zoomAimStart.current;
      if (!start || !zoomFocusArmed.current) return;
      window.clearTimeout(aimResetTimer);
      aimResetTimer = null;
      zoomAimStart.current = null;
      zoomFocusTarget.current = null;
      zoomSightReturn.current = null;
      setCenteredCursor(false);
      controls.enabled = false;
      zoomReturn.current = {
        fromPosition:camera.position.clone(),
        toPosition:start.position,
        fromTarget:controls.target.clone(),
        toTarget:defaultTarget.clone(),
        elapsed:0,
        duration:3,
      };
      invalidate();
    };
    const scheduleAimRestore = () => {
      window.clearTimeout(aimResetTimer);
      aimResetTimer = window.setTimeout(restoreUncommittedAim,110);
    };
    const retargetZoom = inward => {
      if (!inward) {
        if (controls.target.distanceToSquared(defaultTarget) > .0001) {
          zoomSightReturn.current={from:controls.target.clone(),to:defaultTarget.clone(),elapsed:0,duration:1.35};
          invalidate();
        }
        return;
      }
      zoomSightReturn.current=null;
      let nextTarget = defaultTarget;
      if (inward) {
        const hovered = scene.getObjectByProperty('uuid', gl.domElement.dataset.cursorObject || '');
        if (typeof hovered?.userData?.roomZoomFocus === 'function') {
          if (zoomFocusTarget.current && zoomFocusTarget.current !== hovered) restoreUncommittedAim();
          if (!zoomAimStart.current) {
            zoomAimStart.current = {position:camera.position.clone(),target:controls.target.clone()};
            setCenteredCursor(true);
          }
          zoomFocusTarget.current = hovered;
          scheduleAimRestore();
        }
        const object = zoomFocusTarget.current;
        if (typeof object?.userData?.roomZoomFocus !== 'function') return;
        object.updateWorldMatrix(true,true);
        focusBounds.setFromObject(object);
        if (focusBounds.isEmpty()) return;
        nextTarget = focusBounds.getCenter(focusCenter);
      }
      controls.target.lerp(nextTarget,.55);
      camera.lookAt(controls.target);
      camera.updateMatrixWorld();
    };
    // Run before OrbitControls' bubble listener so its dolly follows the newly
    // aimed line of sight instead of always moving toward the middle of the desk.
    const aimWheel = event => {
      interruptZoomReturn();
      if (!controls.enabled || !event.deltaY) return;
      retargetZoom(event.deltaY < 0);
    };
    const interruptPointer = () => { zoomSightReturn.current=null;interruptZoomReturn(); };
    const cancelAimWhenPointerLeaves = () => {
      const hoveredId = gl.domElement.dataset.cursorObject;
      if (zoomFocusTarget.current && zoomFocusTarget.current.uuid !== hoveredId) restoreUncommittedAim();
    };
    gl.domElement.addEventListener('wheel',aimWheel,{capture:true,passive:true});
    gl.domElement.addEventListener('pointerdown',interruptPointer,{capture:true,passive:true});
    gl.domElement.addEventListener('cursor-object-change',cancelAimWhenPointerLeaves);
    const listeners = new Set();
    const getSnapshot = () => {
      const distance = camera.position.distanceTo(controls.target);
      return {
        progress: zoomProgressForDistance(distance, controls.minDistance, controls.maxDistance),
        multiplier: zoomMultiplier(homeDistance, distance),
        enabled: controls.enabled,
      };
    };
    const notifyZoom = () => {
      const snapshot = getSnapshot();
      listeners.forEach(listener => listener(snapshot));
      // There is no lower buffer zone: object-directed aiming starts at any
      // room zoom and remains tentative until it focuses or rolls back.
      if (snapshot.progress < ROOM_FOCUS_PROGRESS) zoomFocusArmed.current = true;
      if (snapshot.progress >= ROOM_FOCUS_PROGRESS && zoomFocusArmed.current) {
        const hovered = scene.getObjectByProperty('uuid', gl.domElement.dataset.cursorObject || '');
        const object = typeof hovered?.userData?.roomZoomFocus === 'function' ? hovered : zoomFocusTarget.current;
        const focus = object?.userData?.roomZoomFocus;
        if (typeof focus === 'function') {
          zoomFocusArmed.current = false;
          zoomAimStart.current = null;
          zoomReturn.current = null;
          zoomSightReturn.current = null;
          setCenteredCursor(false);
          window.clearTimeout(aimResetTimer);
          focus();
        }
      }
    };
    const zoomApi = {
      getSnapshot,
      subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
      setProgress(progress) {
        interruptZoomReturn();
        if (!controls.enabled) return;
        const distance = distanceForZoomProgress(progress, controls.minDistance, controls.maxDistance);
        retargetZoom(distance < camera.position.distanceTo(controls.target));
        camera.position.sub(controls.target).setLength(distance).add(controls.target);
        controls.update();
        invalidate();
      },
    };
    const onChange = () => { invalidate(); notifyZoom(); };
    controls.addEventListener('change', onChange);
    orbit.current = controls; paperOrbit.current = controls;
    emitZoom.current = notifyZoom;
    roomZoomBridge.setApi(zoomApi);
    return () => { window.clearTimeout(aimResetTimer); setCenteredCursor(false); gl.domElement.removeEventListener('wheel',aimWheel,{capture:true}); gl.domElement.removeEventListener('pointerdown',interruptPointer,{capture:true}); gl.domElement.removeEventListener('cursor-object-change',cancelAimWhenPointerLeaves); controls.removeEventListener('change', onChange); controls.dispose(); emitZoom.current = () => {}; roomZoomBridge.setApi(null); orbit.current = null; paperOrbit.current = null; };
  }, [camera, gl, scene, invalidate, paperOrbit, roomHome]);
  useEffect(() => {
    if(photo||workBoard||entered||outside||notebook||upliance||noteMode)zoomSightReturn.current=null;
    if(orbit.current) {
      orbit.current.enabled = !interactionBlocked && !photo && !workBoard && !entered && !outside && !notebook && !upliance && !!transition.current?.done;
      emitZoom.current();
    }
  }, [interactionBlocked, entered, outside, notebook, upliance, photo, workBoard, noteMode]);
  useEffect(() => { if (orbit.current) orbit.current.enableDamping = !reduced; }, [reduced]);
  const focused = !!(photo || workBoard || entered || outside || notebook || upliance || noteMode);
  const lookTarget = useRef(new Vector3(...ROOM_TARGET));
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
  const outsideCallback=useRef(onOutsideArrive);
  outsideCallback.current=onOutsideArrive;
  useEffect(() => {
    const returningToRoom = !focused && wasFocused.current;
    const resetRoom = !focused && appliedRoomReset.current !== roomResetKey;
    if (resetRoom || returningToRoom) {
      appliedRoomReset.current = roomResetKey;
      roomPosition.current = roomHome.clone();
    }
    const entrance = !transition.current && !focused;
    if (focused && !wasFocused.current) roomPosition.current = camera.position.clone();
    wasFocused.current = focused;
    if (orbit.current) {
      orbit.current.enabled = false;
      orbit.current.maxDistance = ROOM_MAX_DISTANCE;
      orbit.current.minAzimuthAngle = ROOM_MIN_AZIMUTH;
      orbit.current.maxAzimuthAngle = ROOM_MAX_AZIMUTH;
    }
    // Approach perpendicular to the screen until its surface covers the viewport.
    const distance = Math.min(1.16, 1.88 / (size.width / size.height)) / Math.tan(21 * Math.PI / 180) * 1.3;
    // Fill the viewport with the open spread, seen almost straight down.
    const notebookDistance = Math.max(.82, 1.15 / (size.width / size.height)) / Math.tan(21 * Math.PI / 180) * 1.2;
    const notebookCamera = new Vector3(...NOTEBOOK_TARGET).add(new Vector3(0, .96, .28).multiplyScalar(notebookDistance));
    // Fit the full square sheet vertically; the previous width-only calculation cropped and offset the note.
    const noteDistance = Math.max(.36,.36/(size.width/size.height))/Math.tan(21*Math.PI/180)*1.25;
    const noteArea = notePlacementRect(noteBoundsForWidth(size.width));
    const noteTarget = noteMode==='wall' ? new Vector3(noteArea.x,noteArea.y,NOTE_WALL_Z) : noteMode==='read' ? new Vector3(noteX,noteY,NOTE_EDITOR_Z) : new Vector3(notePlacement.x,notePlacement.y+.053,notePlacement.z);
    const noteCamera = noteMode==='wall'
      ? noteTarget.clone().add(new Vector3(0,0,Math.max(2.5,(noteArea.width/2+.415)/(size.width/size.height))/Math.tan(21*Math.PI/180)))
      : noteTarget.clone().add(noteMode==='read'?new Vector3(0,0,noteDistance):new Vector3(0,.995,.1).multiplyScalar(noteDistance));
    const applianceTarget=upliance ? new Vector3(...upliance.target) : null;
    const applianceDistance=upliance ? Math.max(upliance.height/2,upliance.width/2/(size.width/size.height))/Math.tan(21*Math.PI/180)*1.35 : 0;
    const applianceCamera=upliance ? applianceTarget.clone().add(new Vector3(...upliance.normal).multiplyScalar(applianceDistance)) : null;
    const photoTarget = new Vector3(...PHOTO_TARGET);
    const photoDistance = Math.max(.68, .68 / (size.width / size.height)) / Math.tan(21 * Math.PI / 180) * 1.3;
    const photoCamera = photoTarget.clone().add(new Vector3(0, 0, photoDistance));
    const projectorPull=projectorState?.pull||{x:0,y:0};
    const workBoardTarget = new Vector3(
      WORK_BOARD_TARGET[0]+projectorPull.x*2.4*1.18,
      WORK_BOARD_TARGET[1]+projectorPull.y*1.35*.82,
      WORK_BOARD_TARGET[2]
    );
    const workBoardDistance = Math.max(1.575,2.6/(size.width/size.height))/Math.tan(21*Math.PI/180)*1.24;
    const workBoardCamera = workBoardTarget.clone().add(new Vector3(0,.05,workBoardDistance));
    transition.current = { from:camera.position.clone(), fovFrom:camera.fov, fovTo:outside ? fov : 42, lookFrom:lookTarget.current.clone(), lookTo:photo ? photoTarget : workBoard ? workBoardTarget : upliance ? applianceTarget : noteMode ? noteTarget : notebook ? new Vector3(...NOTEBOOK_TARGET) : outside ? new Vector3(targetX,targetY,targetZ) : (entered ? new Vector3(1.5, .2128, -.51) : new Vector3(...ROOM_TARGET)), to:photo ? photoCamera : workBoard ? workBoardCamera : upliance ? applianceCamera : noteMode ? noteCamera : notebook ? notebookCamera : outside ? new Vector3(cameraX,cameraY,cameraZ) : entered ? new Vector3(1.5, .2128 + .139173 * distance, -.51 + .990268 * distance)  : (resetRoom ? roomHome.clone() : roomPosition.current?.clone() || roomHome.clone()), duration:entrance ? 2.4 : 1.45, elapsed:entrance && !reduced ? -.35 : noteMode==='wall' && !reduced ? -.65 : 0, done:false };
    invalidate();
  }, [focused, photo, workBoard, projectorState, upliance, noteMode, noteX, noteY, notePlacement, entered, outside, notebook, cameraX, cameraY, cameraZ, targetX, targetY, targetZ, fov, reduced, camera, size.width, size.height, roomHome, roomResetKey, invalidate]);
  useFrame((state, dt) => {
    const returning = zoomReturn.current;
    if (returning && !focused) {
      returning.elapsed += Math.min(dt,.05);
      const progress = Math.min(1,returning.elapsed/returning.duration);
      // A non-zero initial slope gives the requested 0.1x start; the quadratic
      // term continuously accelerates the camera through the three-second return.
      const ease = .1*progress+.9*progress*progress;
      camera.position.lerpVectors(returning.fromPosition,returning.toPosition,ease);
      orbit.current?.target.lerpVectors(returning.fromTarget,returning.toTarget,ease);
      camera.lookAt(orbit.current?.target || returning.toTarget);
      camera.updateMatrixWorld();
      if(progress<1)state.invalidate();
      else {
        zoomReturn.current=null;
        if(orbit.current){
          orbit.current.target.copy(returning.toTarget);
          orbit.current.enabled=!interactionBlocked;
          orbit.current.update();
          emitZoom.current();
        }
      }
      return;
    }
    const sightReturn=zoomSightReturn.current;
    if(sightReturn&&!focused){
      sightReturn.elapsed+=Math.min(dt,.05);
      const progress=Math.min(1,sightReturn.elapsed/sightReturn.duration);
      const ease=progress*progress*(3-2*progress);
      orbit.current?.target.lerpVectors(sightReturn.from,sightReturn.to,ease);
      camera.lookAt(orbit.current?.target||sightReturn.to);
      camera.updateMatrixWorld();
      if(progress<1)state.invalidate();
      else {
        zoomSightReturn.current=null;
        orbit.current?.target.copy(sightReturn.to);
        orbit.current?.update();
      }
      return;
    }
    const t = transition.current;
    if (pauseCamera) return;
    if (!t || t.done) {
      // OrbitControls emits change only while damping is still moving the camera.
      if (orbit.current?.enabled) orbit.current.update();
      return;
    }
    t.elapsed += Math.min(dt, .05);
    const progress = reduced ? 1 : Math.max(0, Math.min(1, t.elapsed / t.duration));
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
        outsideCallback.current?.();
      }
      if (!photo && !workBoard && !entered && !outside && !notebook && !upliance && !noteMode && orbit.current) {
        orbit.current.target.copy(lookTarget.current);
        orbit.current.enabled = !interactionBlocked;
        orbit.current.update();
        emitZoom.current();
      }
      if (entered && !outside) callback.current();
    }
  }, -1);
  return null;
}
/* Removed letter-clock implementation.
function LetterClock({ use24Hour, onSelect, keyboardFocused, registerRoomAction, onHover }) {
  const [now,setNow]=useState(()=>new Date());
  useEffect(()=>{const interval=window.setInterval(()=>setNow(new Date()),250);return()=>window.clearInterval(interval);},[]);
  useEffect(()=>registerRoomAction?.('letter-clock',onSelect),[registerRoomAction,onSelect]);
  const time=`${String(use24Hour?now.getHours():now.getHours()%12||12).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  return <InteractiveObject focused={keyboardFocused} label={`Letter clock · ${time} · click to inspect`} onHover={onHover} onFocus={onSelect}><group position={[-1.96,3.12,-3.065]} onClick={event=>{event.stopPropagation();if(event.delta<=5)onSelect?.();}}>
    <mesh position={[0,0,-.025]} castShadow receiveShadow><boxGeometry args={[1.7,1.7,.12]}/><meshStandardMaterial color="#111817" roughness={.42} metalness={.28}/></mesh><mesh position={[0,0,.045]}><boxGeometry args={[1.62,1.62,.04]}/><meshStandardMaterial color="#53645c" roughness={.52} metalness={.18}/></mesh><LetterClockFace now={now} use24Hour={use24Hour}/>
  </group></InteractiveObject>;
}
*/

export default function MonitorScene({ roomYear=DEFAULT_ROOM_YEAR, optimised = false, paperInventory, onPickUpPaper, basketScore, celebrating, onBasket, photo, onPhotoOpen, workBoard, workBoardTile, onWorkBoardOpen, onWorkBoardTileSelect, projectorState, onProjectorChange, onPlaybackChange, onCeilingPowerChange, onNotebookTear, onPaperMotionChange, aimingPaper, heldPaper, paperControls, onPaperThrown, tornPages, keyboardTarget, registerRoomAction, upliance, upliancePage, uplianceArrived, uplianceControlsRef, onUplianceArrive, onUplianceSelect, propPlacement, glassesPlacement, stickyNotePlacement, lensSettings, entered, reduced, onEnter, onArrive, lampOn, onLampToggle, onWindowSelect, outside, onCityReady, desktopRef, desktop, notebook, notebookPage, onNotebookOpen, onHover, notebookOpen, onNotebookPageChange, onNotebookExit, citySettings, wearingGlasses, glassesLens, glassesLeaving, onWearGlasses, stickyNotes, noteEditorRef, roomResetKey }) {
  const { sceneReady } = useAfterHoursTransition();
  const onRoomReady = useCallback(() => {
    sceneReady();
    preloadAboutJourney();
  }, [sceneReady]);
  const paperOrbit = useRef(null);
  const [lightDragging,setLightDragging]=useState(false);
  const [projectorDragging,setProjectorDragging]=useState(false);
  const [fireflyLightHit,setFireflyLightHit]=useState(0);
  const [monitorReady,setMonitorReady]=useState(false);
  const [uplianceReady,setUplianceReady]=useState(false);
  const [outsideArrived,setOutsideArrived]=useState(false);
  useEffect(()=>{if(!outside)setOutsideArrived(false);},[outside]);
  const markMonitorReady=useCallback(()=>setMonitorReady(true),[]);
  const markUplianceReady=useCallback(()=>setUplianceReady(true),[]);
  const markOutsideArrived=useCallback(()=>setOutsideArrived(true),[]);
  const currentRoom=roomYear==='2026';
  const graduationRoom=roomYear==='2025';
  const atmosphere=ROOM_ATMOSPHERE[roomYear]||ROOM_ATMOSPHERE['2026'];
  const showObject=id=>roomHasObject(roomYear,id);
  const exteriorSettled=outside&&outsideArrived;
  const screensReady=monitorReady&&(!currentRoom||uplianceReady);
  const [roomAssetsReady,setRoomAssetsReady]=useState(false);
  const [notebookImagesReady,setNotebookImagesReady]=useState(false);
  const markRoomAssetsReady=useCallback(()=>setRoomAssetsReady(true),[]);
  const markNotebookImagesReady=useCallback(()=>setNotebookImagesReady(true),[]);
  const markFireflyLightHit=useCallback(()=>setFireflyLightHit(value=>value+1),[]);
  return <Canvas events={roomEvents} onPointerMissed={()=>{if(notebook)onNotebookExit();}} shadows={!optimised} camera={{ position:[6, 3.5, 14.8], fov:42 }} dpr={optimised ? (notebook || upliance ? 1 : .75) : notebook || upliance ? [1, 2] : 1} frameloop={optimised ? "never" : "demand"} gl={{alpha:true, antialias:true, toneMapping:ACESFilmicToneMapping, toneMappingExposure:.85}}>
    <FpsMeter/>
    <OptimisedFrames enabled={optimised}/>
    {screensReady && <FirstRoomFrame onReady={onRoomReady}/>}
    {screensReady && currentRoom && <PreloadAssets onReady={markRoomAssetsReady} onError={markRoomAssetsReady}/>}
    {!optimised && <StationaryShadows/>}
    <color attach="background" args={[atmosphere.background]} />
    <group onClick={event=>{if(notebook && event.delta<=5){event.stopPropagation();onNotebookExit();}}}>
    <NightEffects optimised={optimised} exposure={outside ? citySettings.exposure : atmosphere.exposure} glow={outside ? citySettings.glow : .55} pixelLens={wearingGlasses && glassesLens === 'pixel'} crayonLens={wearingGlasses && glassesLens === 'crayon'} sketchLens={wearingGlasses && glassesLens === 'sketch'} glassesLeaving={glassesLeaving} lensSettings={lensSettings} />
    {screensReady && <Suspense fallback={null}><CityExterior onReady={onCityReady} settings={citySettings} year={roomYear} outside={exteriorSettled} rain={graduationRoom&&exteriorSettled} reduced={reduced}/></Suspense>}
    {screensReady && <Suspense fallback={null}><FlyingPlane active={exteriorSettled} reduced={reduced} settings={citySettings} year={roomYear}/></Suspense>}
    <hemisphereLight args={[atmosphere.sky,atmosphere.ground,outside?citySettings.ambient:atmosphere.ambient]} />
    <directionalLight userData={{cacheStationaryShadow:true}} position={[3,5,4]} intensity={atmosphere.directional} color={atmosphere.directionalColor} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-normalBias={.04} />
    <pointLight position={[-4.6,2,-2.5]} intensity={atmosphere.windowLight} distance={12} decay={2} color={atmosphere.windowColor} />
    <Suspense fallback={null}><InteractiveObject focused={keyboardTarget==='monitor'} label="Monitor · explore my work" onHover={onHover} onFocus={notebook ? onNotebookExit : onEnter}><Monitor basketScore={basketScore} reduced={reduced} onReady={markMonitorReady} onEnter={notebook ? onNotebookExit : onEnter} desktopRef={desktopRef} desktop={desktop} /></InteractiveObject></Suspense>
    <Suspense fallback={null}><Radio visible={showObject('radio')} onPlaybackChange={onPlaybackChange} keyboardFocused={keyboardTarget==='radio'} registerRoomAction={registerRoomAction} onHover={onHover}/></Suspense>
    {screensReady && showObject('photo') && <PhotoFrame reduced={reduced} focused={photo} keyboardFocused={keyboardTarget==='photo'} onSelect={onPhotoOpen} onHover={onHover}/>}
    <Camera paperOrbit={paperOrbit} photo={photo} workBoard={workBoard} projectorState={projectorState} pauseCamera={aimingPaper} {...{upliance,onUplianceArrive,entered,outside,notebook,citySettings,reduced,onArrive,roomResetKey}} onOutsideArrive={markOutsideArrived} noteMode={stickyNotes.editor ? (stickyNotes.editor.id?'read':'write') : stickyNotes.placing?'wall':null} noteX={stickyNotes.editor?.x} noteY={stickyNotes.editor?.y} notePlacement={stickyNotePlacement} interactionBlocked={aimingPaper || lightDragging || projectorDragging || stickyNotes.dragging || !!stickyNotes.editor || !!stickyNotes.placing}/>
    {screensReady && currentRoom && <Suspense fallback={null}><PaperBalls reduced={reduced} orbitControls={paperOrbit} onScore={onBasket} onMotionChange={onPaperMotionChange} aiming={aimingPaper} heldPaper={heldPaper} controls={paperControls} onThrown={onPaperThrown} canThrow={!photo && !entered && !outside && !notebook && !upliance && !stickyNotes.editor && !stickyNotes.placing}/></Suspense>}
    {screensReady && currentRoom && <Suspense fallback={null}><BasketballHoop/></Suspense>}
    {screensReady && showObject('paper-pile') && <Suspense fallback={null}><PaperPile inventory={paperInventory} aiming={aimingPaper} onPickUp={onPickUpPaper} keyboardFocused={keyboardTarget==='paper-pile'} registerRoomAction={registerRoomAction} onHover={onHover} interactive={!aimingPaper&&!photo&&!entered&&!outside&&!notebook&&!upliance&&!stickyNotes.editor&&!stickyNotes.placing}/></Suspense>}
    {currentRoom && <StickyNotes api={stickyNotes} onHover={onHover} reduced={reduced} placement={stickyNotePlacement}/>}
    {currentRoom && stickyNotes.editor && <NoteProjection editor={stickyNotes.editor} elementRef={noteEditorRef} placement={stickyNotePlacement}/>}
    {screensReady && <Suspense fallback={null}><Chair/></Suspense>}
    {screensReady && roomYear!=='2021' && <Suspense fallback={null}><Plant/></Suspense>}
    {screensReady && currentRoom && <Suspense fallback={null}><Fireflies optimised={optimised} reduced={reduced} onLightHit={markFireflyLightHit}/></Suspense>}
    {screensReady && currentRoom && <Suspense fallback={null}><Stool placement={propPlacement?.stool}/></Suspense>}
    {screensReady && currentRoom && <Suspense fallback={null}><Pascal placement={propPlacement?.pascal}/></Suspense>}
    {currentRoom && <Suspense fallback={null}><Upliance celebrating={celebrating} preloadArtwork={roomAssetsReady&&notebookImagesReady} onReady={markUplianceReady} keyboardFocused={keyboardTarget==='upliance'} registerRoomAction={registerRoomAction} controlsRef={uplianceControlsRef} focused={!!upliance} zoomComplete={uplianceArrived} workPage={upliancePage} onSelect={onUplianceSelect} placement={propPlacement?.upliance} reduced={reduced} interactive={!photo && !entered && !outside && !notebook && !upliance && !stickyNotes.editor && !stickyNotes.placing} onHover={onHover}/></Suspense>}
    {screensReady && showObject('ceiling-light') && <Suspense fallback={null}><CeilingLight optimised={optimised} fireflyHit={fireflyLightHit} onPowerChange={onCeilingPowerChange} basketScore={basketScore} reduced={reduced} onDragging={setLightDragging} interactive={!photo&&!entered&&!outside&&!notebook&&!upliance&&!stickyNotes.editor&&!stickyNotes.placing} keyboardFocused={keyboardTarget==='ceiling-light'} registerRoomAction={registerRoomAction} onHover={onHover}/></Suspense>}
    <CozyRoom roomYear={roomYear} outside={outside} keyboardTarget={keyboardTarget} registerRoomAction={registerRoomAction} reduced={reduced} wearingGlasses={wearingGlasses} glassesPlacement={glassesPlacement} glassesLens={glassesLens} onWearGlasses={onWearGlasses} onWindowSelect={notebook ? onNotebookExit : onWindowSelect} onHover={onHover} />
    {screensReady && graduationRoom && <WorkBuildBoard focused={workBoard} selectedTile={workBoardTile} keyboardFocused={keyboardTarget==='work-board'} registerRoomAction={registerRoomAction} onSelect={onWorkBoardOpen} onTileSelect={onWorkBoardTileSelect} onHover={onHover} onDragging={setProjectorDragging} projectorState={projectorState} onProjectorChange={onProjectorChange}/>}
    {screensReady && <InteractiveObject moving focused={keyboardTarget==='notebook'} label="Notebook · ideas & sketches" onHover={onHover} onFocus={onNotebookOpen}><Notebook roomYear={roomYear} onImagesReady={markNotebookImagesReady} onTear={onNotebookTear} canTear={true} tornPages={tornPages} focused={notebook} open={notebookOpen} onPageChange={onNotebookPageChange} page={notebookPage} reduced={reduced} onOpen={onNotebookOpen} /></InteractiveObject>}
    {screensReady && <Suspense fallback={null}><Keyboard /></Suspense>}
    {screensReady && <Suspense fallback={null}><InteractiveObject focused={keyboardTarget==='desk-lamp'} label={lampOn ? "Lamp · turn off" : "Lamp · turn on"} onHover={onHover}><DeskLamp basketScore={basketScore} reduced={reduced} on={lampOn} registerRoomAction={registerRoomAction} onToggle={notebook ? onNotebookExit : onLampToggle} /></InteractiveObject></Suspense>}
    <pointLight position={[1.5,.15,.1]} color="#9cc8df" intensity={3} distance={5} />
    </group>
  </Canvas>;
}
