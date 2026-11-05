import { useEffect, useState } from 'react';

// Pose values reuse the same SVG geometry; delays are deliberately uneven.
const curl=side=>[
  {[side]:1},{[side]:2},{[side]:3},
  {[side]:4,delay:400},
  {[side]:3},{[side]:2},{[side]:1},{delay:120},
];
const frames=[
  {rest:true,band:false,delay:120},
  {dressing:true,behind:true,bandBehind:true,band:[35,24,14,14],hands:[[42,31],[104,36]],delay:100},
  {dressing:true,behind:true,bandBehind:true,band:[14,24,14,14],hands:[[21,31],[104,36]],delay:100},
  {dressing:true,band:[-4,23,14,14],hands:[[3,30],[104,36]],delay:140},
  {dressing:true,band:[-12,0,16,20],hands:[[-4,10],[104,24]],delay:120},
  {dressing:true,band:[0,-16,107,8],hands:[[0,-12],[107,-12]],delay:120},
  {dressing:true,band:[-6,-10,119,8],hands:[[-6,-6],[113,-6]],delay:140},
  {dressing:true,band:[-6,2,119,8],hands:[[-6,6],[113,6]],delay:360},
  {dressing:true,band:[-6,2,119,8],hands:[[-14,15],[121,15]],delay:100},
  {dressing:true,band:[3,2,101,8],hands:[[-6,26],[113,26]],delay:80},
  {dressing:true,delay:120},
  // Reach behind the torso first; the weights emerge from its silhouette.
  {dressing:true,behind:true,hands:[[40,36],[67,36]],delay:160},
  {behind:true,hands:[[40,36],[67,36]],delay:100},
  {behind:true,hands:[[24,36],[83,36]],delay:100},
  {behind:true,hands:[[8,36],[99,36]],delay:100},
  {delay:120},
  ...curl('right'),...curl('left'),{delay:400},
  ...curl('right'),...curl('left'),{delay:400},
  // Reverse the pickup before touching the headband.
  {behind:true,hands:[[8,36],[99,36]],delay:100},
  {behind:true,hands:[[24,36],[83,36]],delay:100},
  {behind:true,hands:[[40,36],[67,36]],delay:140},
  {dressing:true,behind:true,hands:[[40,36],[67,36]],delay:100},
  {dressing:true,hands:[[3,20],[104,20]],delay:100},
  {dressing:true,hands:[[9,6],[98,6]],delay:140},
  {dressing:true,band:[-6,2,119,8],hands:[[-6,6],[113,6]],delay:180},
  {dressing:true,band:[-6,-14,119,8],hands:[[-6,-10],[113,-10]],delay:140},
  {dressing:true,band:[-12,-8,40,12],hands:[[-5,-2],[104,20]],delay:100},
  {dressing:true,band:[-4,23,14,14],hands:[[3,30],[104,36]],delay:100},
  {dressing:true,behind:true,bandBehind:true,band:[14,24,14,14],hands:[[21,31],[104,36]],delay:100},
  {dressing:true,behind:true,bandBehind:true,band:[35,24,14,14],hands:[[42,31],[104,36]],delay:100},
  {rest:true,band:false,delay:1500},
];
// Hands travel outward around the shoulder before returning above the head.
const handArc=[[3,36],[-12,24],[-18,4],[-6,-12],[16,-18]];
export const GYM_DURATION_MS=frames.reduce((total,frame)=>total+(frame.delay||80),0);

// One SVG: dress once, then alternate stepped dumbbell presses.
export default function GymMascot({paused=false}) {
  const [frame,setFrame]=useState(0);
  const [hidden,setHidden]=useState(false);
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{setHidden(document.hidden);setReduced(media.matches);};
    update();document.addEventListener('visibilitychange',update);media.addEventListener('change',update);
    return ()=>{document.removeEventListener('visibilitychange',update);media.removeEventListener('change',update);};
  },[]);
  useEffect(()=>{
    if(paused||hidden||reduced||frame===frames.length-1)return;
    const timer=setTimeout(()=>setFrame(value=>value+1),frames[frame].delay||80);
    return ()=>clearTimeout(timer);
  },[frame,paused,hidden,reduced]);
  const pose=reduced?{}:frames[frame];
  const left=pose.left||0,right=pose.right||0;
  const [lx,ly]=pose.hands?.[0]||handArc[left];
  const [rx,ry]=pose.hands?.[1]||[107-handArc[right][0],handArc[right][1]];
  const [bx,by,bw,bh]=pose.band||[9,2,89,8];
  const weights=!pose.dressing&&!pose.rest;
  const torso=<g><path d="M11 0h85v65H11z" fill="#DD775B"/><path d="M21 16h11v11H21zM75 16h11v11H75z" fill="#111a20"/></g>;
  const hands=<g fill="#ed9474"><rect x={lx-5} y={ly-5} width="10" height="10"/><rect x={rx-5} y={ry-5} width="10" height="10"/></g>;
  return <svg viewBox="0 0 107 86" aria-hidden="true" shapeRendering="crispEdges">
    <g fill="#DD775B">{[11,32,64,85].map(x=><rect key={x} x={x} y="60" width="11" height="26"/>)}</g>
    <g transform={`translate(0 ${left===4||right===4?-2:0})`}>
      {torso}
      <g>
        <path d="M0 23h22v22H0z" fill="#DD775B"/>
        <path d={`M16 31H${Math.min(3,lx)}V${ly}H${lx}`} fill="none" stroke="#DD775B" strokeWidth="12"/>
        <g opacity={weights?1:0} transform={`translate(${lx-3} ${ly-36})`}>
          <path d="M-12 33h30v6h-30z" fill="#65757e"/>
          <path d="M-16 26h9v20h-9zM-20 30h4v12h-4zM10 26h9v20h-9zM19 30h4v12h-4z" fill="#15232d"/>
          <path d="M-14 28h3v14h-3zM12 28h3v14h-3z" fill="#344c5c"/>
          <path d="M-2 31h10v10H-2z" fill="#ed9474"/>
        </g>
      </g>
      <g>
        <path d="M85 23h22v22H85z" fill="#DD775B"/>
        <path d={`M91 31H${Math.max(104,rx)}V${ry}H${rx}`} fill="none" stroke="#DD775B" strokeWidth="12"/>
        <g opacity={weights?1:0} transform={`translate(${rx-104} ${ry-36})`}>
          <path d="M89 33h30v6H89z" fill="#65757e"/>
          <path d="M88 26h9v20h-9zM84 30h4v12h-4zM114 26h9v20h-9zM123 30h4v12h-4z" fill="#15232d"/>
          <path d="M90 28h3v14h-3zM116 28h3v14h-3z" fill="#344c5c"/>
          <path d="M99 31h10v10H99z" fill="#ed9474"/>
        </g>
      </g>
      {pose.dressing&&pose.behind&&hands}
      {pose.behind&&!pose.bandBehind&&torso}
      {pose.band!==false&&<g>
        <rect x={bx} y={by} width={bw} height={bh} fill="#f4dfc9"/>
        <rect x={bx} y={by+bh-4} width={bw} height="3" fill="#42627b"/>
        <rect x={bx+3} y={by} width={bw-6} height="2" fill="#fff2e4"/>
      </g>}
      {pose.dressing&&!pose.behind&&hands}
      {pose.bandBehind&&torso}
    </g>
  </svg>;
}
