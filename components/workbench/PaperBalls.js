import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { collideHoop, crossedHoop, hoopForWidth } from './basketball.mjs';
import { createPaperModel } from './paperRendering.mjs';
import { PAPER_AIM_DISTANCE, paperAimOffsetY, paperPickupProgress, rotatePaperCamera } from './paperAim.mjs';

import { PAPER_RADIUS as RADIUS, PAPER_PILE_ORIGIN, pilePosition } from './paperInventoryState.mjs';
// Room surfaces match CozyRoom: desktop, floor, back and side walls.
function stepBody(body, dt, onScore, hoop) {
  const p = body.position, v = body.velocity;
  const previous = body.previous.copy(p);
  const previousY = p.y;
  v.y -= 9.8 * dt;
  v.multiplyScalar(Math.exp(-.16 * dt));
  p.addScaledVector(v, dt);
  collideHoop(body, previous, RADIUS, hoop);
  if (!body.scored && crossedHoop(previous, p, RADIUS, hoop)) { body.scored = true; onScore?.(); }
  const desk = Math.abs(p.x) < 5 + RADIUS && p.z > -2.2 - RADIUS && p.z < 2.1 + RADIUS;
  const surface = desk && previousY >= -1.5 + RADIUS - .01 ? -1.5 : -4.8;
  if (p.y < surface + RADIUS && v.y < 0) {
    p.y = surface + RADIUS;
    v.y = Math.abs(v.y) < .45 ? 0 : -v.y * .32;
    const friction = Math.exp(-7 * dt);
    v.x *= friction; v.z *= friction;
    if (v.lengthSq() < .006) { v.set(0, 0, 0); body.sleeping = true; }
  }
  for (const [axis, min, max] of [['x', -9.2, 23.9], ['z', -3.1, 52.7]]) {
    if (p[axis] < min + RADIUS) { p[axis] = min + RADIUS; v[axis] = Math.abs(v[axis]) * .35; }
    if (p[axis] > max - RADIUS) { p[axis] = max - RADIUS; v[axis] = -Math.abs(v[axis]) * .35; }
  }
  body.rotation.x += v.z * dt / RADIUS;
  body.rotation.z -= v.x * dt / RADIUS;
}

function Paper({ body, asset, aiming = false, onScore, reduced, hoop }) {
  const mesh = useRef(null);
  const { camera } = useThree();
  const destination = useMemo(() => new Vector3(), []);
  const model = useMemo(() => createPaperModel(asset, aiming), [asset, aiming]);
  useFrame((state, delta) => {
    if (!mesh.current) return;
    if (aiming) {
      destination.set(body.offset.x, paperAimOffsetY(camera.fov) + body.offset.y, -PAPER_AIM_DISTANCE).applyQuaternion(camera.quaternion).add(camera.position);
      body.pickupElapsed += Math.min(delta, .05);
      const progress = paperPickupProgress(body.pickupElapsed, reduced);
      body.ready = progress === 1;
      body.position.copy(body.pickupOrigin).lerp(destination, progress);
      body.position.y += Math.sin(progress * Math.PI) * .35;
      mesh.current.quaternion.copy(camera.quaternion);
      if (!body.ready) state.invalidate();
    } else if (!body.sleeping) {
      // Bounded substeps prevent tunnelling and remain stable after tab suspension.
      const elapsed = Math.min(delta, .05), steps = Math.max(1, Math.ceil(elapsed / (1 / 120)));
      for (let i = 0; i < steps; i++) stepBody(body, elapsed / steps, onScore, hoop);
      mesh.current.rotation.set(body.rotation.x, body.rotation.y, body.rotation.z);
      state.invalidate();
    }
    mesh.current.position.copy(body.position);
  });
  return <group ref={mesh} dispose={null}><primitive object={model}/></group>;
}

export default function PaperBalls({ heldPaper, aiming, controls, onThrown, canThrow, onMotionChange, onScore, reduced, orbitControls }) {
  const { scene: asset } = useLoader(GLTFLoader, '/models/paper-ball/scene.gltf');
  const [bodies, setBodies] = useState([]);
  const { camera, size, invalidate } = useThree();
  const hoop = hoopForWidth(size.width);
  const lastThrown = useRef(null);
  const moving = useRef(false);
  useFrame(() => {
    const active = bodies.some(body => !body.sleeping);
    if (moving.current !== active) { moving.current = active; onMotionChange(active); }
  });
  const prepared = useMemo(() => heldPaper ? {
    ...heldPaper, pickupOrigin: new Vector3(...PAPER_PILE_ORIGIN).add(new Vector3(...pilePosition(0))), pickupElapsed: 0, ready: reduced, position: new Vector3(), previous: new Vector3(), velocity: new Vector3(), offset: { x: 0, y: 0 }, rotation: { x: 0, y: 0, z: 0 }, sleeping: false,
  } : null, [heldPaper, reduced]);
  useEffect(() => {
    if (aiming && prepared) { prepared.offset.x = 0; prepared.offset.y = 0; prepared.pickupElapsed = 0; prepared.ready = reduced; invalidate(); }
  }, [aiming, prepared, reduced, invalidate]);
  // Bodies remain mounted after a throw, including their final resting transforms.
  useLayoutEffect(() => {
    controls.current = {
      ready() { return !!prepared?.ready; },
      rotate(dx, dy) {
        if (!aiming) return;
        rotatePaperCamera(camera, orbitControls.current, dx, dy, size.height);
        invalidate();
      },
      move(dx, dy) {
        if (!aiming || !prepared?.ready) return;
        const height = 2 * PAPER_AIM_DISTANCE * Math.tan(camera.fov * Math.PI / 360);
        prepared.offset.x = dx / size.height * height;
        prepared.offset.y = -dy / size.height * height;
        invalidate();
      },
      flick(vx, vy) {
        if (!canThrow || !aiming || !prepared?.ready || !heldPaper || lastThrown.current === heldPaper.id) return;
        const speed = Math.hypot(vx, vy);
        if (speed < .12) { prepared.offset.x = 0; prepared.offset.y = 0; invalidate(); return; }
        lastThrown.current = heldPaper.id;
        // Screen-space flick direction, transformed into the current camera basis.
        // Two successive 10% power increases; keep the same input curve.
        const direction = new Vector3(vx / speed * 1.3, -vy / speed * 1.3, -1).normalize().applyQuaternion(camera.quaternion);
        prepared.position.set(prepared.offset.x, paperAimOffsetY(camera.fov) + prepared.offset.y, -PAPER_AIM_DISTANCE).applyQuaternion(camera.quaternion).add(camera.position);
        prepared.velocity.copy(direction).multiplyScalar(6.534 * Math.max(.4, Math.min(2.5, speed / .9)));
        setBodies(current => [...current, prepared]);
        onThrown(heldPaper.id); invalidate();
      },
    };
    return () => { controls.current = null; };
  }, [heldPaper, aiming, prepared, canThrow, camera, size.height, controls, onThrown, invalidate, orbitControls]);
  return <>{bodies.map(body => <Paper key={body.id} body={body} asset={asset} onScore={onScore} hoop={hoop} />)}{aiming && prepared && <Paper key={`aim-${prepared.id}`} body={prepared} asset={asset} aiming reduced={reduced} />}</>;
}
