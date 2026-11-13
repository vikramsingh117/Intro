import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { AnimationMixer, Box3, CatmullRomCurve3, Quaternion, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils';

const MODEL_URL = '/models/firefly/scene.gltf';
const LOOP_SECONDS = 36.5;
const MODEL_FORWARD = new Vector3(0, -1, 0);
const RECOIL_AXIS = new Vector3(0, 0, 1);
const WAYPOINTS = {
  plant: new Vector3(-6.2, -.2, .2),
  monitor: new Vector3(3.28, .36, .12),
  upliance: new Vector3(6.08, .36, -.04),
  chair: new Vector3(1.52, -2.5, 3.34),
  light: new Vector3(6.22, 3.72, -.45),
  lightRecoil: new Vector3(5.72, 2.65, -.05),
  radio: new Vector3(-3.65, -.28, 1.05),
};
const route = points => new CatmullRomCurve3(points, false, 'catmullrom', .45);
const ROUTES = {
  plantToMonitor: route([
    WAYPOINTS.plant,
    new Vector3(-5.65, .42, -.15),
    new Vector3(-3.4, .62, .15),
    new Vector3(-.7, .2, -.42),
    new Vector3(1.45, .62, .05),
    WAYPOINTS.monitor,
  ]),
  monitorToUpliance: route([
    WAYPOINTS.monitor,
    new Vector3(4.15, .72, -.28),
    new Vector3(5.35, .64, .12),
    WAYPOINTS.upliance,
  ]),
  monitorToChair: route([
    WAYPOINTS.monitor,
    new Vector3(3.25, .2, 1.25),
    new Vector3(2.65, -.85, 2.45),
    new Vector3(1.85, -1.9, 3.18),
    WAYPOINTS.chair,
  ]),
  uplianceToRadio: route([
    WAYPOINTS.upliance,
    new Vector3(4.65, .82, -.5),
    new Vector3(2.25, .72, -.74),
    new Vector3(-.5, .56, -.28),
    new Vector3(-2.55, .25, .48),
    WAYPOINTS.radio,
  ]),
  chairToRadio: route([
    WAYPOINTS.chair,
    new Vector3(.9, -1.25, 2.85),
    new Vector3(-.25, -.25, 2.2),
    new Vector3(-2.15, .2, 1.55),
    WAYPOINTS.radio,
  ]),
  uplianceToLight: route([
    WAYPOINTS.upliance,
    new Vector3(6.1, 1.4, -.12),
    new Vector3(6.15, 2.7, -.3),
    WAYPOINTS.light,
  ]),
  lightRecoil: route([
    WAYPOINTS.light,
    new Vector3(5.98, 3.3, -.24),
    WAYPOINTS.lightRecoil,
  ]),
  recoilToUpliance: route([
    WAYPOINTS.lightRecoil,
    new Vector3(5.86, 1.7, -.1),
    WAYPOINTS.upliance,
  ]),
  radioToPlant: route([
    WAYPOINTS.radio,
    new Vector3(-4.45, .28, .72),
    new Vector3(-5.45, .42, .16),
    WAYPOINTS.plant,
  ]),
};
const SWARM = [
  { seed: .2, offset: [-.05, .03, 0], pace: -.09, hoverSpeed: 1.45, flutterSpeed: 1.88, wingSpeed: .88, striker: true },
  { seed: 2.4, offset: [.08, -.04, .08], pace: .11, hoverSpeed: 1.82, flutterSpeed: 2.34, wingSpeed: 1.12 },
  { seed: 4.7, offset: [-.02, .08, -.09], pace: -.04, hoverSpeed: 1.63, flutterSpeed: 2.07, wingSpeed: .98, scout: true },
];

const ease = value => value * value * (3 - 2 * value);

function hoverAt(base, time, config, point, tangent) {
  const orbit = time * config.hoverSpeed + config.seed;
  point.copy(base);
  point.x += config.offset[0] + Math.cos(orbit) * .1;
  point.y += config.offset[1] + Math.sin(orbit * (1.17 + config.seed * .025)) * (.09 + config.seed * .006);
  point.z += config.offset[2] + Math.sin(orbit * (1.05 - config.seed * .018)) * .1;
  tangent.set(-Math.sin(orbit), Math.cos(orbit * 1.23) * .25, Math.cos(orbit)).normalize();
  return false;
}

function flyRoute(path, progress, time, config, point, tangent, land = false) {
  const clamped = Math.max(0, Math.min(1, progress));
  const paced = Math.max(0, Math.min(1, clamped + Math.sin(clamped * Math.PI) * config.pace));
  const amount = ease(paced);
  const spread = land ? 1 - amount : 1;
  const flutter = time * config.flutterSpeed + config.seed;
  path.getPoint(amount, point);
  path.getTangent(amount, tangent).normalize();
  point.x += config.offset[0] * spread + Math.sin(flutter * .73) * .025 * spread;
  point.y += config.offset[1] * spread + Math.sin(flutter) * .07 * spread;
  point.z += config.offset[2] * spread + Math.cos(flutter * 1.27) * .065 * spread;
  return false;
}

function knockbackRoute(path, progress, time, config, point, tangent) {
  const clamped = Math.max(0, Math.min(1, progress));
  const amount = 1 - (1 - clamped) ** 3;
  const flutter = time * config.flutterSpeed + config.seed;
  path.getPoint(amount, point);
  path.getTangent(amount, tangent).normalize();
  point.y += Math.sin(flutter * 2.1) * .025 * (1 - clamped);
  point.z += Math.cos(flutter * 1.7) * .035 * (1 - clamped);
  return false;
}

function walkChair(time, point, tangent) {
  const progress = Math.max(0, Math.min(1, (time - 16.5) / 3));
  const step = progress * Math.PI * 2;
  point.copy(WAYPOINTS.chair);
  point.x += Math.sin(step) * .24;
  point.y += Math.abs(Math.sin(step * 2)) * .008;
  point.z += Math.sin(progress * Math.PI) * .08;
  tangent.set(Math.cos(step), 0, Math.cos(progress * Math.PI) * .16).normalize();
  return true;
}

function choreography(time, config, point, tangent) {
  const cycle = time % LOOP_SECONDS;
  if (cycle < 5) return hoverAt(WAYPOINTS.plant, time, config, point, tangent);
  if (cycle < 10) return flyRoute(ROUTES.plantToMonitor, (cycle - 5) / 5, time, config, point, tangent);
  if (cycle < 11.5) return hoverAt(WAYPOINTS.monitor, time, config, point, tangent);
  if (cycle < 16.5) {
    const path = config.scout ? ROUTES.monitorToChair : ROUTES.monitorToUpliance;
    return flyRoute(path, (cycle - 11.5) / 5, time, config, point, tangent, config.scout);
  }
  if (cycle < 26.5) {
    if (config.scout) {
      if (cycle < 19.5) return walkChair(cycle, point, tangent);
      return flyRoute(ROUTES.chairToRadio, (cycle - 19.5) / 7, time, config, point, tangent);
    }
    if (cycle < 21.5) {
      if (!config.striker || cycle < 17.5) return hoverAt(WAYPOINTS.upliance, time, config, point, tangent);
      if (cycle < 19) return flyRoute(ROUTES.uplianceToLight, (cycle - 17.5) / 1.5, time, config, point, tangent);
      if (cycle < 19.7) return knockbackRoute(ROUTES.lightRecoil, (cycle - 19) / .7, time, config, point, tangent);
      return flyRoute(ROUTES.recoilToUpliance, (cycle - 19.7) / 1.8, time, config, point, tangent);
    }
    return flyRoute(ROUTES.uplianceToRadio, (cycle - 21.5) / 5, time, config, point, tangent);
  }
  if (cycle < 31.5) return hoverAt(WAYPOINTS.radio, time, config, point, tangent);
  return flyRoute(ROUTES.radioToPlant, (cycle - 31.5) / 5, time, config, point, tangent);
}

function Firefly({ source, animations, config, reduced, onLightHit }) {
  const group = useRef(null);
  const elapsed = useRef(0);
  const impactCycle = useRef(-1);
  const actions = useRef({ fly: null, idle: null });
  const { invalidate } = useThree();
  const point = useMemo(() => new Vector3(), []);
  const tangent = useMemo(() => new Vector3(), []);
  const orientation = useMemo(() => new Quaternion(), []);
  const recoilRoll = useMemo(() => new Quaternion(), []);
  const { model, mixer, materials } = useMemo(() => {
    const clone = cloneSkeleton(source);
    const materials = [];
    clone.traverse(node => {
      if (!node.isMesh) return;
      node.castShadow = true;
      const tune = material => {
        const copy = material.clone();
        if (copy.name === 'M_Firefly') copy.emissiveIntensity = 7;
        materials.push(copy);
        return copy;
      };
      node.material = Array.isArray(node.material) ? node.material.map(tune) : tune(node.material);
    });
    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const scale = .1232 / Math.max(size.x, size.y, size.z);
    clone.scale.multiplyScalar(scale);
    clone.position.sub(center.multiplyScalar(scale));
    return { model: clone, mixer: new AnimationMixer(clone), materials };
  }, [source]);
  useEffect(() => {
    const flyClip = animations.find(animation => animation.name.includes('Landed_Fly')) || animations[0];
    const idleClip = animations.find(animation => animation.name.includes('Landed_Idol'));
    const fly = flyClip ? mixer.clipAction(flyClip) : null;
    const idle = idleClip ? mixer.clipAction(idleClip) : null;
    if (fly) { fly.time = config.seed % fly.getClip().duration; fly.setEffectiveTimeScale(config.wingSpeed); fly.play(); }
    if (idle) { idle.time = config.seed % idle.getClip().duration; idle.setEffectiveWeight(0); idle.play(); }
    actions.current = { fly, idle };
    invalidate();
    return () => {
      actions.current = { fly: null, idle: null };
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      materials.forEach(material => material.dispose());
    };
  }, [animations, config.seed, config.wingSpeed, invalidate, materials, mixer, model]);
  useFrame((_, delta) => {
    if (!group.current) return;
    if (reduced) {
      group.current.position.set(-6.2 + config.offset[0], -.2 + config.offset[1], .2 + config.offset[2]);
      return;
    }
    elapsed.current += Math.min(delta, .05);
    const flightTime = elapsed.current;
    const cycleNumber = Math.floor(flightTime / LOOP_SECONDS);
    const cycleTime = flightTime % LOOP_SECONDS;
    if (config.striker && cycleTime >= 19 && impactCycle.current !== cycleNumber) {
      impactCycle.current = cycleNumber;
      onLightHit?.();
    }
    const resting = choreography(flightTime, config, point, tangent);
    group.current.position.copy(point);
    orientation.setFromUnitVectors(MODEL_FORWARD, tangent);
    const recoiling = config.striker && cycleTime >= 19 && cycleTime < 19.7;
    if (recoiling) {
      const recoilProgress = (cycleTime - 19) / .7;
      recoilRoll.setFromAxisAngle(RECOIL_AXIS, Math.sin(recoilProgress * Math.PI) * 1.05);
      orientation.multiply(recoilRoll);
    }
    group.current.quaternion.slerp(orientation, recoiling ? .55 : resting ? .08 : .14);
    actions.current.fly?.setEffectiveWeight(resting ? 0 : 1);
    actions.current.idle?.setEffectiveWeight(resting ? 1 : 0);
    mixer.update(Math.min(delta, .05) * 1.35);
    invalidate();
  });
  return <group ref={group}>
    <primitive object={model}/>
    <mesh scale={.8} raycast={()=>null}>
      <sphereGeometry args={[.0192, 10, 7]}/>
      <meshStandardMaterial color="#fff6a8" emissive="#ceff45" emissiveIntensity={8} toneMapped={false}/>
    </mesh>
    <pointLight color="#d9ff72" intensity={2.1} distance={1.45} decay={2}/>
  </group>;
}

export default function Fireflies({ reduced = false, onLightHit }) {
  const { scene, animations } = useLoader(GLTFLoader, MODEL_URL);
  return <group name="Firefly swarm">
    {SWARM.map(config => <Firefly key={config.seed} source={scene} animations={animations} config={config} reduced={reduced} onLightHit={onLightHit}/>)}
  </group>;
}

useLoader.preload(GLTFLoader, MODEL_URL);
