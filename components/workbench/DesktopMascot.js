import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from '../../styles/Workbench.module.css';

const HINTS = [
  { id:'Terminal', text:'The terminal has a few things worth trying. Start with help.' },
  { id:'notes', text:'You can leave a note on the wall outside. Look for the sticky notes by the desk.' },
  { id:'window', text:'Have you looked outside the window? There’s a whole night city out there.' },
  { id:'upliance', text:'There’s more of Vikram’s work on the upliance screen beside the monitor.' },
  { id:'Photos', text:'The Photos app lets you leave a photo in this shared workspace.' },
];

// The approved neutral SVG, separated into parts for lightweight transform animation.
// Reference: https://ayotomcs.me/claude-mascot (original character by Anthropic).
function Character() {
  return <svg viewBox="0 0 107 86" aria-hidden="true" shapeRendering="crispEdges">
    <g className={styles.mascotAwakeSprite} fill="#DD775B">
      <g>{[11,32,64,85].map(x=><rect key={x} x={x} y="60" width="11" height="26"/>)}</g>
      <g className={styles.mascotBody}><rect x="11" width="85" height="65"/>
        <rect className={styles.mascotLeftArm} y="21" width="22" height="23"/>
        <rect className={styles.mascotRightArm} x="85" y="21" width="22" height="23"/>
        <g className={styles.mascotEyes} fill="black">
          <g className={styles.mascotEyesOpen}>{[21,75].map(x=><rect key={x} x={x} y="11" width="11" height="11"/>)}</g>
          <g className={styles.mascotEyesHalf}>{[21,75].map(x=><rect key={x} x={x} y="16" width="11" height="6"/>)}</g>
          <g className={styles.mascotEyesClosed}>{[21,75].map(x=><rect key={x} x={x} y="20" width="11" height="2"/>)}</g>
        </g>
      </g>
    </g>
    <g className={styles.mascotCrouchSprite} fill="#DD775B">
      {[11,32,64,85].map(x=><rect key={x} x={x} y="68" width="11" height="18"/>)}
      <rect x="11" y="14" width="85" height="57"/>
      <rect y="43" width="22" height="23"/><rect x="85" y="43" width="22" height="23"/>
      <rect x="21" y="32" width="11" height="6" fill="black"/><rect x="75" y="32" width="11" height="6" fill="black"/>
    </g>
    <g className={styles.mascotSleepSprite} fill="#DD775B">
      <rect x="11" y="49" width="85" height="37"/>
      <rect y="64" width="22" height="22"/><rect x="85" y="64" width="22" height="22"/>
      <rect x="25" y="64" width="11" height="3" fill="black"/><rect x="70" y="64" width="11" height="3" fill="black"/>
      <g className={styles.mascotSleepZs}>
        {[0,1,2].map(i=><g key={i} className={styles.mascotSleepZ} style={{'--z-delay':`${i*.6}s`}} transform={`translate(${62+i*12} ${27-i*14})`}>
          <rect width="10" height="2"/><rect x="6" y="2" width="2" height="2"/><rect x="4" y="4" width="2" height="2"/><rect x="2" y="6" width="2" height="2"/><rect y="8" width="10" height="2"/>
        </g>)}
      </g>
    </g>
  </svg>;
}

const DesktopMascot=forwardRef(function DesktopMascot({interactive, visible, reduced, hasWindow},ref){
  const button=useRef(null);
  const seen=useRef(new Set()),cursor=useRef(-1);
  const [hint,setHint]=useState(null),[paused,setPaused]=useState(false),[wordCount,setWordCount]=useState(0),[tucking,setTucking]=useState(false);
  useEffect(()=>{
    if(!hasWindow||!interactive||!visible||reduced||paused){setTucking(false);return;}
    setHint(null);setTucking(true);
    const timer=setTimeout(()=>setTucking(false),640);
    return ()=>clearTimeout(timer);
  },[hasWindow,interactive,visible,reduced,paused]);
  useEffect(()=>{
    if(!hint)return;
    const dismissOutside=event=>{if(!button.current?.contains(event.target))setHint(null);};
    document.addEventListener('pointerdown',dismissOutside,true);
    return ()=>document.removeEventListener('pointerdown',dismissOutside,true);
  },[hint]);
  useEffect(()=>{
    const update=()=>setPaused(document.hidden);
    document.addEventListener('visibilitychange',update);update();
    return ()=>document.removeEventListener('visibilitychange',update);
  },[]);
  useEffect(()=>{setHint(null);},[interactive,visible]);
  useEffect(()=>{
    if(!hint)return;
    const total=hint.text.split(' ').length;
    if(reduced){setWordCount(total);return;}
    if(paused||!visible)return;
    const timer=setInterval(()=>setWordCount(count=>{
      const next=Math.min(count+3,total);
      if(next===total)clearInterval(timer);
      return next;
    }),180);
    return ()=>clearInterval(timer);
  },[hint,reduced,paused,visible]);
  useImperativeHandle(ref,()=>({
    cancel:()=>setHint(null),
    markSeen:id=>seen.current.add(id),
  }),[]);
  const nextHint=()=>{
    setTucking(false);
    let index=(cursor.current+1)%HINTS.length;
    for(let step=0;step<HINTS.length;step++){
      const candidate=(cursor.current+1+step)%HINTS.length;
      if(!seen.current.has(HINTS[candidate].id)){index=candidate;break;}
    }
    cursor.current=index;seen.current.add(HINTS[index].id);setWordCount(0);setHint(HINTS[index]);
  };
  return <div className={styles.mascotLayer} data-paused={paused||!visible||reduced} data-compact={hasWindow&&interactive}>
    {hint&&interactive&&<div className={styles.mascotHint} id="mascot-hint">
      <p className={styles.mascotSpeech} aria-hidden="true"><span className={styles.mascotSpeechSpace}>{hint.text}</span><span className={styles.mascotSpeechReveal}>{hint.text.split(' ').slice(0,wordCount).join(' ')}</span></p>
      <span className={styles.screenReaderOnly} aria-live="polite">{hint.text}</span>
    </div>}
    <div className={styles.mascotActor} data-tucking={tucking&&!hint} data-pose={hint?'hint':!interactive?'wave':hasWindow?'sleep':'idle'}>
      <button ref={button} className={styles.mascotButton} onClick={nextHint} onKeyDown={event=>{if(event.key==='Escape'&&hint){event.preventDefault();event.stopPropagation();setHint(null);}}} disabled={!interactive} aria-label={hint?'Show the next workspace hint':'Ask the mascot for a workspace hint'} aria-expanded={!!hint} aria-controls={hint?'mascot-hint':undefined}><Character/></button>
    </div>
  </div>;
});
export default DesktopMascot;
