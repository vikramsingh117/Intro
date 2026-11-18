// Animates a three-firefly swarm through the plant, monitor, chair, lights, and radio.
// Fireflies cast throttled, low-priority shadows but never receive them; lamp impacts also drive CeilingLight.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { AnimationMixer, Box3, Quaternion, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils';

const MODEL_URL = '/models/firefly/scene.gltf';
import { LOOP_SECONDS, SWARM, choreography, liveFireflies } from './fireflyChoreography.mjs';
const MODEL_FORWARD = new Vector3(0, -1, 0);
const RECOIL_AXIS = new Vector3(0, 0, 1);
function Firefly({ optimised, source, animations, config, reduced, onLightHit }) {
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
      node.receiveShadow = false;
      // Their parent moves continuously, so refresh shared shadow maps less often than larger interactions.
      node.userData.shadowMotionInterval = 1 / 15;
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
  useEffect(()=>{model.traverse(node=>{if(node.isMesh)node.castShadow=!optimised;});invalidate();},[model,optimised,invalidate]);
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
      liveFireflies.delete(config.seed);
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
    // The reusable position vector stays owned by this firefly; pixel consumers only read it.
    const sample = liveFireflies.get(config.seed);
    if (sample) sample.time = flightTime;
    else liveFireflies.set(config.seed, { point, time: flightTime });
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

export default function Fireflies({ optimised = false, reduced = false, onLightHit }) {
  const { scene, animations } = useLoader(GLTFLoader, MODEL_URL);
  return <group name="Firefly swarm">
    {SWARM.map(config => <Firefly optimised={optimised} key={config.seed} source={scene} animations={animations} config={config} reduced={reduced} onLightHit={onLightHit}/>)}
  </group>;
}

useLoader.preload(GLTFLoader, MODEL_URL);
