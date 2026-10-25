import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from '../../styles/Workbench.module.css';

export default function DesktopContextMenu({ point, width, iconsVisible, onClose, onRefresh, onToggleIcons, onOpen, onShowDesktop, hasWindows }) {
  const menu=useRef(null);
  const [more,setMore]=useState(false);
  const [position,setPosition]=useState(point);
  useLayoutEffect(()=>{
    const node=menu.current;
    setPosition({x:Math.max(8,Math.min(point.x,width-node.offsetWidth-8)),y:Math.max(8,Math.min(point.y,780-node.offsetHeight-8))});
  },[point,width,more]);
  useEffect(()=>{
    menu.current?.querySelector('button')?.focus({preventScroll:true});
  },[more]);
  useEffect(()=>{
    const dismiss=event=>{if(!menu.current?.contains(event.target))onClose(false);};
    window.addEventListener('pointerdown',dismiss,true);
    return ()=>window.removeEventListener('pointerdown',dismiss,true);
  },[onClose]);
  const action=fn=>{fn();onClose(true);};
  const keyDown=event=>{
    event.stopPropagation();
    const items=[...menu.current.querySelectorAll('button:not(:disabled)')];
    const index=items.indexOf(document.activeElement);
    if(event.key==='Escape'){event.preventDefault();onClose(true);}
    else if(event.key==='Tab')onClose(false);
    else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
      items[next]?.focus();
    }
  };
  return <div ref={menu} className={styles.desktopContextMenu} role="menu" aria-label="Desktop options"
    style={{left:position.x,top:position.y}} onKeyDown={keyDown} onContextMenu={event=>{event.preventDefault();event.stopPropagation();}}>
    <button role="menuitemcheckbox" aria-checked={iconsVisible} onClick={()=>action(onToggleIcons)}><span>{iconsVisible?'✓':'○'}</span>Show desktop icons</button>
    <button role="menuitem" onClick={()=>action(onRefresh)}><span>↻</span>Refresh</button>
    <div role="separator"/>
    <button role="menuitem" onClick={()=>action(()=>onOpen('Terminal'))}><span>›_</span>Open in Terminal</button>
    <button role="menuitem" onClick={()=>action(()=>onOpen('Task Manager'))}><span>▥</span>Task Manager</button>
    <button role="menuitem" disabled={!hasWindows} onClick={()=>action(onShowDesktop)}><span>▱</span>Show desktop</button>
    {more && <>
      <div role="separator"/>
      <button role="menuitem" onClick={()=>action(()=>onOpen('About Me'))}><span>◉</span>About this workspace</button>
      <button role="menuitem" onClick={()=>action(()=>onOpen('Credits'))}><span>ⓘ</span>Asset credits</button>
    </>}
    <div role="separator"/>
    <button role="menuitem" aria-expanded={more} onClick={()=>setMore(value=>!value)}><span>⋯</span>{more?'Show fewer options':'Show more options'}</button>
  </div>;
}
