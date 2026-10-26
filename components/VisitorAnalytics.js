import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { flushActivity, trackInteraction } from '../lib/visitor-analytics';

export default function VisitorAnalytics(){
  const router=useRouter();
  useEffect(()=>{
    trackInteraction('page_view');flushActivity();
  },[router.pathname]);
  useEffect(()=>{
    const click=event=>{
      const element=event.target.closest?.('button,a,[role="tab"]');
      if(!element||element.closest('[inert]'))return;
      // Explicit labels describe controls; do not scrape text that could contain visitor content.
      let destination='';
      if(element.tagName==='A'){try{const url=new URL(element.href);destination=url.protocol==='mailto:'?'email':`${url.hostname}${url.pathname}${url.hash}`;}catch{}}
      const label=element.dataset.track||element.getAttribute('aria-label')||element.querySelector('[data-app]')?.dataset.app||destination||element.tagName.toLowerCase();
      trackInteraction('click',label);
    };
    const hidden=()=>{if(document.hidden)flushActivity(true);};
    const leave=()=>flushActivity(true);
    const timer=setInterval(()=>flushActivity(),4000);
    document.addEventListener('click',click,true);
    document.addEventListener('visibilitychange',hidden);
    window.addEventListener('pagehide',leave);
    return()=>{clearInterval(timer);document.removeEventListener('click',click,true);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',leave);};
  },[]);
  return null;
}
