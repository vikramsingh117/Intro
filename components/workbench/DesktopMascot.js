import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from '../../styles/Workbench.module.css';
import { trackInteraction } from '../../lib/visitor-analytics';
import { mascotTransition, paginateHint } from './mascotBehavior.mjs';
import useMascotVoice from './useMascotVoice';
import MusicMascot from './MusicMascot';
import GymMascot, { GYM_DURATION_MS } from './GymMascot';

const HINTS = [
  { id:'radio', text:'You can pause music by clicking on the radio.' },
  { id:'Terminal', text:'Try help in the terminal. There’s more to explore.' },
  { id:'notes', text:'Leave a little hello on the sticky-note wall.' },
  { id:'window', text:'Click the window. The city is still awake.' },
  { id:'upliance', text:'Explore more work on the upliance screen.' },
  { id:'ceiling-light', text:'Lift the hanging light, then let it drop.' },
  { id:'desk-lamp', text:'Click the desk lamp to change the mood.' },
  { id:'notebook', text:'Click notebook pages to flip. Drag the right page to tear it.' },
  { id:'paper-ball', text:'Click the paper-ball icon, then flick to throw. Esc puts it away.' },
  { id:'drawer', text:'Click the top drawer to peek inside.' },
  { id:'glasses', text:'Try the glasses in the drawer for a different view.' },
  { id:'My Work', text:'Open My Work for the story behind the builds.' },
  { id:'About Me', text:'Meet the person behind this desk in About Me.' },
  { id:'Projects', text:'Take a closer look at the Projects app.' },
  { id:'AI Assistant', text:'Ask the AI Assistant about Vikram’s work.' },
  { id:'Photos', text:'Leave a photo in this shared workspace.' },
  { id:'Task Manager', text:'Curious what’s running? Open Task Manager.' },
  { id:'Credits', text:'Meet the scene’s makers in Credits.' },
  { id:'GitHub', text:'The GitHub shortcut leads to my code.' },
  { id:'LinkedIn', text:'Find my professional story through the LinkedIn shortcut.' },
  { id:'LeetCode', text:'The LeetCode shortcut opens my problem-solving profile.' },
  { id:'Email', text:'Use the email shortcut to say hello.' },
  { id:'taskbar', text:'Use the taskbar to bring an open app back into view.' },
  { id:'desktop-menu', text:'Right-click the desktop for a few more options.' },
];

// The approved neutral SVG, separated into parts for lightweight transform animation.
// Reference: https://ayotomcs.me/claude-mascot (original character by Anthropic).
function Character() {
  return <svg viewBox="0 0 107 86" aria-hidden="true" shapeRendering="crispEdges">
    <g className={styles.mascotAwakeSprite} fill="#DD775B">
      <g>{[11,32,64,85].map((x,index)=><rect key={x} className={index%2?styles.mascotWalkFootBack:styles.mascotWalkFootFront} x={x} y="60" width="11" height="26"/>)}</g>
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

const DesktopMascot=forwardRef(function DesktopMascot({interactive, visible, reduced, hasWindow, musicPlaying=false},ref){
  const button=useRef(null);
  const { unlock, playLetter, stop } = useMascotVoice();
  const walkLane=useRef(null);
  const hintBox=useRef(null),wasSleeping=useRef(false);
  const seen=useRef(new Set()),cursor=useRef(-1);
  const [hint,setHint]=useState(null),[paused,setPaused]=useState(false),[characterCount,setCharacterCount]=useState(0),[motion,setMotion]=useState(null);
  const [fontReady,setFontReady]=useState(false),[pages,setPages]=useState([]),[page,setPage]=useState(0),[motionStyle,setMotionStyle]=useState({});
  const [walking,setWalking]=useState(false);
  const [gym,setGym]=useState(false);
  const [musicPhase,setMusicPhase]=useState('off');
  useEffect(()=>{
    setMusicPhase(previous=>musicPlaying?(reduced?'on':'putting'):previous==='off'||reduced?'off':'removing');
  },[musicPlaying,reduced]);
  const musicVisible=musicPlaying||musicPhase!=='off';
  const stroll=useRef({x:0,target:0,walking:false,wait:4800,stops:0,gym:false});
  const sleeping=hasWindow&&interactive&&!hint;
  const canWalk=visible&&!paused&&!reduced&&!musicVisible&&!sleeping&&!motion;
  useEffect(()=>{
    if(!canWalk)return;
    const timer=setInterval(()=>{
      const lane=walkLane.current,actor=button.current?.parentElement;
      if(!lane||!actor)return;
      const state=stroll.current;
      if(!hint&&!state.gym&&(button.current.matches(':hover')||document.activeElement===button.current))return;
      const min=Math.min(0,12-actor.offsetLeft);
      state.x=Math.max(min,Math.min(0,state.x));
      if(!state.walking){
        state.wait-=100;
        if(state.wait<=0){
          state.gym=false;setGym(false);
          const distance=Math.min(40+Math.random()*100,(0-min)*.3);
          let direction=Math.random()<.5?-1:1;
          if(state.x+direction*distance<min||state.x+direction*distance>0)direction*=-1;
          state.target=Math.max(min,Math.min(0,state.x+direction*distance));
          lane.style.setProperty('--walk-look',`${direction*3}px`);
          state.walking=true;setWalking(true);
        }
      }else{
        const delta=Math.max(min,Math.min(0,state.target))-state.x;
        state.x+=Math.sign(delta)*Math.min(4,Math.abs(delta));
        if(Math.abs(delta)<=4){
          state.walking=false;state.stops+=1;
          state.gym=state.stops%2===0;
          state.wait=state.gym?GYM_DURATION_MS:4800+Math.random()*1200;
          setGym(state.gym);setWalking(false);
        }
      }
      lane.style.transform=`translateX(${state.x}px)`;
    },100);
    return ()=>clearInterval(timer);
  },[canWalk,hint]);
  const roaming=canWalk&&walking;
  const workingOut=gym&&!musicVisible&&!sleeping&&!motion&&!reduced;
  useEffect(()=>{
    if(!hint||!interactive)return;
    let frame;
    const follow=()=>{
      const lane=walkLane.current,box=hintBox.current,actor=button.current?.parentElement;
      if(lane&&box&&actor){
        const transform=getComputedStyle(lane).transform;
        const x=transform==='none'?0:new DOMMatrixReadOnly(transform).m41;
        const center=actor.offsetLeft+actor.offsetWidth/2+x;
        // Keep the hint above its walking owner, bounded by the desktop edges.
        box.style.left=`${Math.max(12,Math.min(lane.clientWidth-box.offsetWidth-12,center-box.offsetWidth/2))}px`;
      }
      frame=requestAnimationFrame(follow);
    };
    follow();
    return ()=>cancelAnimationFrame(frame);
  },[hint,interactive]);
  useEffect(()=>{
    let active=true;
    const ready=()=>{if(active)setFontReady(true);};
    if(document.fonts)document.fonts.load('16px MascotPixel').then(ready,ready);else ready();
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    const previous=wasSleeping.current;wasSleeping.current=sleeping;
    const transition=mascotTransition(previous,sleeping,interactive&&visible&&!reduced&&!paused);
    if(previous!==sleeping&&interactive&&visible)trackInteraction(sleeping?'mascot_sleep':'mascot_wake',hint?'hint':'apps');
    const mobile=window.matchMedia('(max-width:760px)').matches;
    const small=mobile?(parseFloat(getComputedStyle(button.current).getPropertyValue('--mobile-touch'))||60):60;
    const full=mobile?Math.max(107,small):107;
    setMotionStyle({'--sleep-scale':full/small,'--wake-scale':small/full,'--tuck-x':mobile?'-8px':'-10px','--tuck-y':mobile?'-72px':'-50px','--wake-x':mobile?'8px':'10px','--wake-y':mobile?'72px':'50px'});
    setMotion(transition);
    if(!transition)return;
    const timer=setTimeout(()=>setMotion(null),640);
    return ()=>clearTimeout(timer);
  },[sleeping,interactive,visible,reduced,paused,hint]);
  useEffect(()=>{
    if(!hint)return;
    const dismissOutside=event=>{if(!button.current?.contains(event.target)){trackInteraction('mascot_hint_dismiss','outside');setHint(null);}};
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
    if(!hint||!fontReady||!hintBox.current)return;
    const element=hintBox.current;
    const context=document.createElement('canvas').getContext('2d');
    const layout=()=>{
      const mobile=window.matchMedia('(max-width:760px)').matches;
      const style=getComputedStyle(element);
      if(context)context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const measure=text=>context?context.measureText(text).width:text.length*parseFloat(style.fontSize);
      const lines=Math.max(1,Math.floor(element.clientHeight/parseFloat(style.lineHeight)));
      // Reserve room for the continuation dots, including during character-by-character reveal.
      setPages(mobile?paginateHint(hint.text,measure,Math.max(1,element.clientWidth-2-measure('...')),lines):[hint.text]);
      setPage(0);setCharacterCount(0);
    };
    layout();
    const observer=new ResizeObserver(layout);observer.observe(element);
    return ()=>observer.disconnect();
  },[hint,fontReady]);
  useEffect(()=>{
    if(!hint||!fontReady||!pages[page])return;
    const total=pages[page].length;
    if(reduced){setCharacterCount(total);return;}
    if(paused||!visible)return;
    if(characterCount<total){
      const character=pages[page][characterCount];
      const previous=pages[page][characterCount-1] || '';
      const delay=/[.!?,;:]/.test(previous)?130:42;
      const timer=setTimeout(()=>{playLetter(character);setCharacterCount(count=>Math.min(count+1,total));},delay);
      return ()=>clearTimeout(timer);
    }
    if(page<pages.length-1){const timer=setTimeout(()=>{setPage(value=>value+1);setCharacterCount(0);},700);return ()=>clearTimeout(timer);}
  },[hint,fontReady,pages,page,characterCount,reduced,paused,visible,playLetter]);
  useEffect(() => {
    if(paused || !visible || !interactive || !hint) stop();
    return stop;
  }, [hint,page,paused,visible,interactive,stop]);
  useImperativeHandle(ref,()=>({
    cancel:()=>setHint(null),
    markSeen:id=>seen.current.add(id),
  }),[]);
  const nextHint=()=>{
    stop();unlock();
    setMotion(null);
    // With reduced motion, a click advances any remaining page before the next hint.
    if(reduced&&hint&&page<pages.length-1){setPage(value=>value+1);setCharacterCount(0);return;}
    let index=(cursor.current+1)%HINTS.length;
    for(let step=0;step<HINTS.length;step++){
      const candidate=(cursor.current+1+step)%HINTS.length;
      if(!seen.current.has(HINTS[candidate].id)){index=candidate;break;}
    }
    cursor.current=index;seen.current.add(HINTS[index].id);setPages([]);setPage(0);setCharacterCount(0);setHint(HINTS[index]);
    trackInteraction('mascot_hint',HINTS[index].id);
  };
  const pageText=pages[page]||'';
  const visibleText=fontReady?pageText.slice(0,characterCount):'';
  const hasMore=characterCount<pageText.length||page<pages.length-1;
  const continuation=visibleText&&hasMore&&!/[.!?]$/.test(visibleText)?'...':'';
  return <div className={styles.mascotLayer} data-paused={paused||!visible||reduced} data-compact={sleeping}>
    {hint&&interactive&&<div ref={hintBox} className={styles.mascotHint} id="mascot-hint">
      <p className={styles.mascotSpeech} aria-hidden="true"><span className={styles.mascotSpeechSpace}>{pageText||hint.text}...</span><span className={styles.mascotSpeechReveal}>{visibleText}{continuation}</span></p>
      <span className={styles.screenReaderOnly} aria-live="polite">{hint.text}</span>
    </div>}
    <div ref={walkLane} className={styles.mascotWalkLane} data-walking={walking} data-running={roaming} data-hint={!!hint}>
    <div className={styles.mascotActor} style={motionStyle} data-tucking={motion==='tucking'} data-waking={motion==='waking'} data-pose={musicVisible?'music':workingOut?'gym':roaming?'walk':canWalk?'wave':hint?'hint':!interactive?'wave':sleeping?'sleep':'idle'}>
      <button ref={button} className={styles.mascotButton} data-track="mascot" data-analytics="semantic" onClick={nextHint} onKeyDown={event=>{if(event.key==='Escape'&&hint){event.preventDefault();event.stopPropagation();trackInteraction('mascot_hint_dismiss','escape');setHint(null);}}} disabled={!interactive} aria-label={hint?'Show the next workspace hint':'Ask the mascot for a workspace hint'} aria-expanded={!!hint} aria-controls={hint?'mascot-hint':undefined}>{musicVisible?<MusicMascot phase={musicPhase==='off'?'putting':musicPhase} onTransitionEnd={()=>setMusicPhase(musicPlaying?'on':'off')}/>:workingOut?<GymMascot paused={paused||!visible}/>:<Character/>}</button>
    </div>
    </div>
  </div>;
});
export default DesktopMascot;
