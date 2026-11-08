import { useCallback, useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import InteractiveObject from './InteractiveObject';
import { createPaperModel } from './paperRendering.mjs';
import { PAPER_PILE_ORIGIN, pilePosition } from './paperInventoryState.mjs';

function PiledBall({ asset, index, id }) {
  const model = useMemo(() => createPaperModel(asset, false), [asset]);
  return <group position={pilePosition(index)} rotation={[id * .63, id * 2.4, id * .37]} dispose={null}>
    <primitive object={model}/>
  </group>;
}

export default function PaperPile({ inventory, aiming, onPickUp, interactive, keyboardFocused, onHover, registerRoomAction }) {
  const { scene: asset } = useLoader(GLTFLoader, '/models/paper-ball/scene.gltf');
  // The ball in your hand is already out of the physical pile; cancelling returns it.
  const balls = aiming ? inventory.slice(1) : inventory;
  const pickUp = useCallback(() => { if (interactive && inventory.length) onPickUp(); }, [interactive, inventory.length, onPickUp]);
  useEffect(() => registerRoomAction?.('paper-pile', pickUp), [registerRoomAction, pickUp]);
  if (!balls.length) return null;
  const height = Math.floor((balls.length - 1) / 6) * .39 + .48;
  const contents = <group position={PAPER_PILE_ORIGIN} onClick={event=>{event.stopPropagation();if(event.delta<=5)pickUp();}}>
    {balls.map((ball,index)=><PiledBall key={ball.id} id={ball.id} asset={asset} index={index}/>)}
    {interactive && <mesh position={[0, height / 2 - .24, 0]}>
      <boxGeometry args={[1.42, height, .95]}/><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false}/>
    </mesh>}
  </group>;
  return interactive ? <InteractiveObject key={balls.length} focused={keyboardFocused} label={`Paper balls · ${inventory.length} remaining · pick up to throw`} onHover={onHover}>{contents}</InteractiveObject> : contents;
}
