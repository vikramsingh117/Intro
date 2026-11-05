import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PAPER_AIM_DISTANCE, paperAimOffsetY } from './paperAim.mjs';

const RADIUS = .24;
// Room surfaces match CozyRoom: desktop, floor, back and side walls.
function stepBody(body, dt) {
  const p = body.position, v = body.velocity;
  const previousY = p.y;
  v.y -= 9.8 * dt;
  v.multiplyScalar(Math.exp(-.16 * dt));
  p.addScaledVector(v, dt);
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

function Paper({ body, asset, aiming = false }) {
  const mesh = useRef(null);
  const { camera } = useThree();
  const model = useMemo(() => {
    const clone = asset.clone(true);
    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3()), size = bounds.getSize(new Vector3());
    const scale = RADIUS * 2 / Math.max(size.x, size.y, size.z);
    clone.scale.multiplyScalar(scale);
    clone.position.copy(center).multiplyScalar(-scale);
    clone.traverse(node => {
      if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; node.raycast = () => null; }
    });
    return clone;
  }, [asset]);
  useFrame((state, delta) => {
    if (!mesh.current) return;
    if (aiming) {
      body.position.set(body.offset.x, paperAimOffsetY(camera.fov) + body.offset.y, -PAPER_AIM_DISTANCE).applyQuaternion(camera.quaternion).add(camera.position);
      mesh.current.quaternion.copy(camera.quaternion);
    } else if (!body.sleeping) {
      // Bounded substeps prevent tunnelling and remain stable after tab suspension.
      const elapsed = Math.min(delta, .05), steps = Math.max(1, Math.ceil(elapsed / (1 / 120)));
      for (let i = 0; i < steps; i++) stepBody(body, elapsed / steps);
      mesh.current.rotation.set(body.rotation.x, body.rotation.y, body.rotation.z);
      state.invalidate();
    }
    mesh.current.position.copy(body.position);
  });
  return <group ref={mesh} dispose={null}><primitive object={model}/></group>;
}

export default function PaperBalls({ heldPaper, aiming, controls, onThrown, canThrow, onMotionChange }) {
  const { scene: asset } = useLoader(GLTFLoader, '/models/paper-ball/scene.gltf');
  const [bodies, setBodies] = useState([]);
  const { camera, size, invalidate } = useThree();
  const lastThrown = useRef(null);
  const moving = useRef(false);
  useFrame(() => {
    const active = bodies.some(body => !body.sleeping);
    if (moving.current !== active) { moving.current = active; onMotionChange(active); }
  });
  const prepared = useMemo(() => heldPaper ? {
    ...heldPaper, position: new Vector3(), velocity: new Vector3(), offset: { x: 0, y: 0 }, rotation: { x: 0, y: 0, z: 0 }, sleeping: false,
  } : null, [heldPaper]);
  useEffect(() => {
    if (aiming && prepared) { prepared.offset.x = 0; prepared.offset.y = 0; invalidate(); }
  }, [aiming, prepared, invalidate]);
  // Bodies remain mounted after a throw, including their final resting transforms.
  useEffect(() => {
    controls.current = {
      move(dx, dy) {
        if (!aiming || !prepared) return;
        const height = 2 * PAPER_AIM_DISTANCE * Math.tan(camera.fov * Math.PI / 360);
        prepared.offset.x = dx / size.height * height;
        prepared.offset.y = -dy / size.height * height;
        invalidate();
      },
      flick(vx, vy) {
        if (!canThrow || !aiming || !heldPaper || lastThrown.current === heldPaper.id) return;
        const speed = Math.hypot(vx, vy);
        if (speed < .12) { prepared.offset.x = 0; prepared.offset.y = 0; invalidate(); return; }
        lastThrown.current = heldPaper.id;
        // Screen-space flick direction, transformed into the current camera basis.
        // Scale all flick strengths to 60% of the previous 9-unit baseline.
        const direction = new Vector3(vx / speed * 1.3, -vy / speed * 1.3, -1).normalize().applyQuaternion(camera.quaternion);
        prepared.position.set(prepared.offset.x, paperAimOffsetY(camera.fov) + prepared.offset.y, -PAPER_AIM_DISTANCE).applyQuaternion(camera.quaternion).add(camera.position);
        prepared.velocity.copy(direction).multiplyScalar(5.4 * Math.max(.4, Math.min(2.5, speed / .9)));
        setBodies(current => [...current, prepared]);
        onThrown(); invalidate();
      },
    };
    return () => { controls.current = null; };
  }, [heldPaper, aiming, prepared, canThrow, camera, size.height, controls, onThrown, invalidate]);
  return <>{bodies.map(body => <Paper key={body.id} body={body} asset={asset} />)}{aiming && prepared && <Paper key={`aim-${prepared.id}`} body={prepared} asset={asset} aiming />}</>;
}
