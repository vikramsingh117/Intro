// Gives focused room close-ups one same-URL history entry so browser Back exits focus before leaving the page.
// It coordinates programmatic exits with Next.js pop-state handling to avoid consuming or creating duplicate entries.
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function useFocusHistory(focused, onExit) {
  const router=useRouter();
  const owned=useRef(false), pending=useRef(false), exit=useRef(onExit);
  exit.current=onExit;
  useEffect(()=>{
    router.beforePopState(()=>{
      if(pending.current){pending.current=false;return false;}
      if(owned.current){owned.current=false;exit.current();return false;}
      return true;
    });
    return ()=>router.beforePopState(()=>true);
  },[router]);
  useEffect(()=>{
    if(focused&&!owned.current&&!pending.current){
      history.pushState({...history.state,roomFocus:true},'',location.href);
      owned.current=true;
    }else if(!focused&&owned.current){
      owned.current=false;pending.current=true;history.back();
    }
  },[focused]);
}
