import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// One same-URL entry represents a focused room view; Back consumes it before leaving.
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
