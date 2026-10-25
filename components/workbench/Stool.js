import { useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';

export default function Stool({ placement=DEFAULT_PROP_PLACEMENT.stool }) {
  const {scene}=useLoader(GLTFLoader,'/models/stool/optimized.gltf');
  const model=useMemo(()=>{
    const clone=scene.clone(true),bounds=new Box3().setFromObject(clone);
    const size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3()),scale=2.4/size.y;
    // The imported stool is a single mesh. Its seat starts at world Y=2.5;
    // stretch the frame below it, then lift the intact seat by the added height.
    const seatBase=2.5,extraHeight=(seatBase-bounds.min.y)*.3;
    clone.updateMatrixWorld(true);
    clone.traverse(node=>{
      if(!node.isMesh)return;
      node.geometry=node.geometry.clone();
      const positions=node.geometry.attributes.position;
      const inverse=node.matrixWorld.clone().invert(),point=new Vector3();
      for(let i=0;i<positions.count;i++){
        point.fromBufferAttribute(positions,i).applyMatrix4(node.matrixWorld);
        point.y=point.y<seatBase?bounds.min.y+(point.y-bounds.min.y)*1.3:point.y+extraHeight;
        point.applyMatrix4(inverse);
        positions.setXYZ(i,point.x,point.y,point.z);
      }
      positions.needsUpdate=true;
      node.geometry.computeVertexNormals();
      node.geometry.computeBoundingBox();node.geometry.computeBoundingSphere();
    });
    clone.scale.multiplyScalar(scale);
    clone.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    clone.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
    return clone;
  },[scene]);
  useEffect(()=>()=>model.traverse(node=>{if(node.isMesh)node.geometry.dispose();}),[model]);
  return <group position={[placement.x,placement.y,placement.z]} rotation={[0,placement.rotation*Math.PI/180,0]} scale={placement.scale}><primitive object={model}/></group>;
}
