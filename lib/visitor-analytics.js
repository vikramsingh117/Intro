// Client-side action names only: never send form contents, messages, photos or terminal input.
let visitId;
let landingPath;
let queue=[];
let sending=0;
let startedAt=0,activeMs=0,visibleSince=null,lastSent=0;
export function syncVisitVisibility(forceHidden=false){
  const now=performance.now();
  if(visibleSince!==null)activeMs+=now-visibleSince;
  visibleSince=startedAt&&!forceHidden&&!document.hidden&&allowedPaths.has(location.pathname)?now:null;
}
const allowedPaths=new Set(['/','/simple','/after-hours','/workbench']);
export function trackInteraction(action,target='') {
  if(typeof window==='undefined'||!allowedPaths.has(location.pathname))return;
  if(!visitId){visitId=crypto.randomUUID();landingPath=location.pathname;startedAt=performance.now();syncVisitVisibility();}
  if(queue.length>=100)return;
  queue.push({id:crypto.randomUUID(),action:action.slice(0,48),target:String(target).slice(0,100),path:location.pathname,at:new Date().toISOString()});
}
export async function flushActivity(beacon=false){
  if(!visitId||(sending&&!beacon))return;
  const now=performance.now();
  if(!beacon&&!queue.length&&now-lastSent<15000)return;
  const durationSeconds=Math.floor((now-startedAt)/1000);
  const activeSeconds=Math.floor((activeMs+(visibleSince===null?0:now-visibleSince))/1000);
  const events=queue.splice(0,25),body=JSON.stringify({visitId,landingPath,events,durationSeconds,activeSeconds});
  lastSent=now;
  if(beacon&&navigator.sendBeacon?.('/api/visit',new Blob([body],{type:'application/json'})))return;
  sending++;
  try{
    const response=await fetch('/api/visit',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true});
    if(!response.ok&&response.status>=500)queue.unshift(...events);
  }catch{queue.unshift(...events);}finally{queue=queue.slice(0,100);sending--;}
}
