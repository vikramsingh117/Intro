import { useEffect, useRef, useState } from 'react';
import localPoint from './desktopPoint';
import styles from '../../styles/Workbench.module.css';

const LIMITS = { left: 10, top: 70, right: 1270, bottom: 718 };
const FULL = { x: 10, y: 70, width: 1260, height: 648 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
// The desktop is perspective-projected onto the monitor, not a flat screen overlay.

function moved(rect, dx, dy) {
  return {...rect, x:clamp(rect.x+dx,LIMITS.left,LIMITS.right-rect.width), y:clamp(rect.y+dy,LIMITS.top,LIMITS.bottom-rect.height)};
}
function resized(rect, edge, dx, dy) {
  let {x,y,width,height}=rect;
  if(edge.includes('e')) width=clamp(width+dx,420,LIMITS.right-x);
  if(edge.includes('s')) height=clamp(height+dy,260,LIMITS.bottom-y);
  if(edge.includes('w')) { x=clamp(x+dx,LIMITS.left,rect.x+rect.width-420); width=rect.x+rect.width-x; }
  if(edge.includes('n')) { y=clamp(y+dy,LIMITS.top,rect.y+rect.height-260); height=rect.y+rect.height-y; }
  return {x,y,width,height};
}
export default function DesktopWindow({ title, desktopRef, active, minimized, zIndex, onFocus, onClose, onMinimize, children }) {
  const [rect,setRect]=useState({x:title==='Terminal'?285:210,y:title==='Terminal'?135:100,width:900,height:540});
  const [maximized,setMaximized]=useState(false);
  const gesture=useRef(null), close=useRef(null), initialFocus=useRef(false);
  useEffect(()=>{if(active && !minimized && !initialFocus.current) {initialFocus.current=true;close.current?.focus({preventScroll:true});}},[active,minimized]);
  const begin=(event,edge)=>{
    if(maximized || event.button!==0 || !desktopRef.current) return;
    event.preventDefault(); event.stopPropagation(); onFocus();
    gesture.current={point:localPoint(desktopRef.current,event),rect,edge};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move=event=>{
    if(!gesture.current) return;
    const start=gesture.current, point=localPoint(desktopRef.current,event);
    setRect(start.edge==='move'?moved(start.rect,point.x-start.point.x,point.y-start.point.y):resized(start.rect,start.edge,point.x-start.point.x,point.y-start.point.y));
  };
  const end=event=>{gesture.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);};
  const keyboard=(event,resize)=>{
    if(maximized || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    const step=event.shiftKey?30:10;
    const dx=event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0;
    const dy=event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0;
    setRect(current=>resize?resized(current,'se',dx,dy):moved(current,dx,dy));
  };
  const bounds=maximized?FULL:rect;
  return <section className={`${styles.desktopWindow} ${active?styles.activeWindow:''}`} aria-label={title} hidden={minimized}
    style={{left:bounds.x,top:bounds.y,width:bounds.width,height:bounds.height,zIndex}} onPointerDownCapture={onFocus} onFocusCapture={onFocus}>
    <header className={styles.windowTitlebar}>
      <div className={styles.windowDrag} data-native-cursor tabIndex={0} role="button" aria-label={`Move ${title}. Use arrow keys to move.`}
        onPointerDown={event=>begin(event,'move')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{gesture.current=null;}}
        onKeyDown={event=>keyboard(event,false)} onDoubleClick={()=>setMaximized(value=>!value)}>{title==='Terminal'?'>_':'▰'} &nbsp; {title}</div>
      <div className={styles.windowActions}>
        <button onClick={onMinimize} aria-label={`Minimize ${title}`}>−</button>
        <button className={styles.maximizeWindow} onClick={()=>setMaximized(value=>!value)} aria-label={`${maximized?'Restore':'Maximize'} ${title}`}>{maximized?'❐':'□'}</button>
        <button ref={close} onClick={onClose} aria-label={`Close ${title}`}>×</button>
      </div>
    </header>
    <div className={`${styles.windowBody} ${title==='AI Assistant'?styles.assistantBody:title==='Terminal'?styles.terminalBody:styles.windowContent}`}>{children}</div>
    {!maximized && ['n','e','s','w','ne','nw','se','sw'].map(edge=><div key={edge} className={styles.resizeHandle} data-native-cursor data-edge={edge}
      role={edge==='se'?'button':undefined} tabIndex={edge==='se'?0:undefined} aria-label={edge==='se'?`Resize ${title}. Use arrow keys to resize.`:undefined}
      onKeyDown={event=>keyboard(event,true)} onPointerDown={event=>begin(event,edge)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{gesture.current=null;}} />)}
  </section>;
}
