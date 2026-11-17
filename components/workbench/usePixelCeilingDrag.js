// Handles captured pointer dragging on the pixel ceiling light and suppresses toggle after a drag.
// Movement is expressed in SVG units before being sent to the shared 3D rope controller.
import { useEffect, useRef } from 'react';
import { ceilingLightBridge } from './ceilingLightBridge';
export default function usePixelCeilingDrag(enabled,root){
  const drag=useRef(null),moved=useRef(false);
  useEffect(()=>{const end=()=>{if(drag.current){drag.current.api.end();drag.current=null;}};window.addEventListener('blur',end);return ()=>{window.removeEventListener('blur',end);end();};},[enabled]);
  const end=event=>{if(!drag.current||drag.current.id!==event.pointerId)return;drag.current.api.end();drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);};
  return {
    onPointerDown:event=>{if(!enabled||event.button!==0)return;moved.current=false;const api=ceilingLightBridge.api;if(!api?.start())return;event.stopPropagation();drag.current={api,id:event.pointerId,x:event.clientX,y:event.clientY,width:root.current.getBoundingClientRect().width};event.currentTarget.setPointerCapture(event.pointerId);},
    onPointerMove:event=>{const g=drag.current;if(!g||g.id!==event.pointerId)return;event.stopPropagation();const dx=event.clientX-g.x,dy=event.clientY-g.y;if(Math.hypot(dx,dy)>4)moved.current=true;if(moved.current)g.api.move(dx*480/g.width,dy*480/g.width);},
    onPointerUp:end,onPointerCancel:end,onLostPointerCapture:end,
    onClickCapture:event=>{if(moved.current){event.preventDefault();event.stopPropagation();moved.current=false;}},
  };
}
