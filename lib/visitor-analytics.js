// Client-side action names only: never send form contents, messages, photos or terminal input.
let visitId;
let landingPath;
let queue=[];
let sending=false;
const allowedPaths=new Set(['/','/simple','/after-hours','/workbench']);
export function trackInteraction(action,target='') {
  if(typeof window==='undefined'||!allowedPaths.has(location.pathname))return;
  if(!visitId){visitId=crypto.randomUUID();landingPath=location.pathname;}
  if(queue.length>=100)return;
  queue.push({id:crypto.randomUUID(),action:action.slice(0,48),target:String(target).slice(0,100),path:location.pathname,at:new Date().toISOString()});
}
export async function flushActivity(beacon=false){
  if(!visitId||!queue.length||sending)return;
  const events=queue.splice(0,25),body=JSON.stringify({visitId,landingPath,events});
  if(beacon&&navigator.sendBeacon?.('/api/visit',new Blob([body],{type:'application/json'})))return;
  sending=true;
  try{
    const response=await fetch('/api/visit',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true});
    if(!response.ok&&response.status>=500)queue.unshift(...events);
  }catch{queue.unshift(...events);}finally{queue=queue.slice(0,100);sending=false;}
}
