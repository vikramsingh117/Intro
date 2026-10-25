import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Matrix4 } from 'three';

export default function NoteProjection({ editor, elementRef }) {
  const surface=useRef(null);
  const {camera,size}=useThree();
  useFrame(()=>{
    if(!surface.current || !elementRef.current)return;
    surface.current.updateWorldMatrix(true,false);camera.updateMatrixWorld();
    const pixels=new Matrix4().set(.72/512,0,0,-.36,0,-.72/512,0,.36,0,0,1,.001,0,0,0,1);
    const viewport=new Matrix4().set(size.width/2,0,0,size.width/2,0,-size.height/2,0,size.height/2,0,0,0,0,0,0,0,1);
    const projection=viewport.multiply(camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(surface.current.matrixWorld).multiply(pixels);
    projection.elements[10]=1;
    elementRef.current.style.transform=`matrix3d(${projection.elements.join(',')})`;
    elementRef.current.style.visibility='visible';
  });
  return <group ref={surface} position={editor.id?[editor.x,editor.y,-3.065]:[3.7,-1.397,.8]} rotation={editor.id?[0,0,0]:[-Math.PI/2,0,0]}/>;
}
