import { Vector3 } from 'three';

const COUNT=32;
export function createLightRope(length,drop=true){
  const points=Array.from({length:COUNT+1},(_,i)=>new Vector3(0,-length*i/COUNT,.015*Math.sin(Math.PI*i/COUNT)));
  const rope={length,points,previous:points.map(p=>p.clone()),delta:new Vector3(),accumulator:0,quiet:0,asleep:false,delay:0};
  if(drop){
    // Prepare a genuinely slack rope before releasing the raised shade.
    const raised=new Vector3(.85,-length+2.4,.2);
    for(let i=0;i<90;i++)stepLightRope(rope,1/60,raised);
    rope.previous.forEach((p,i)=>p.copy(points[i]));
    rope.accumulator=0;rope.delay=.35;
  }
  return rope;
}

export function stepLightRope(rope,elapsed,target){
  if(rope.asleep&&!target)return;
  if(target)rope.delay=0;
  if(rope.delay>0){rope.delay=Math.max(0,rope.delay-Math.min(elapsed,.05));return;}
  const {points,previous,delta,length}=rope,last=points.length-1,step=1/120;
  rope.accumulator+=Math.min(elapsed,.05);
  while(rope.accumulator>=step){
    rope.accumulator-=step;
    for(let i=1;i<=last;i++){
      delta.subVectors(points[i],previous[i]).multiplyScalar(Math.exp(-.65*step));
      previous[i].copy(points[i]);points[i].add(delta);points[i].y-=18*step*step;
    }
    for(let pass=0;pass<48;pass++){
      points[0].set(0,0,0);
      if(target)points[last].copy(target);
      for(let i=0;i<last;i++){
        delta.subVectors(points[i+1],points[i]);
        const distance=delta.length();if(distance<1e-8)continue;
        // Half the inverse mass gives the shade twice its previous weight.
        const a=i===0?0:1,b=i+1===last?(target?0:.06):1;
        if(!a&&!b)continue;
        delta.multiplyScalar((distance-length/last)/distance/(a+b));
        points[i].addScaledVector(delta,a);points[i+1].addScaledVector(delta,-b);
      }
    }
    points[0].set(0,0,0);
    if(target){points[last].copy(target);previous[last].copy(target);}
  }
  let motion=0;
  for(let i=1;i<=last;i++)motion=Math.max(motion,points[i].distanceToSquared(previous[i]));
  const end=points[last];
  rope.quiet=!target&&motion<1e-7&&Math.hypot(end.x,end.z)<.025?rope.quiet+elapsed:0;
  if(rope.quiet>.5){
    points.forEach((p,i)=>{p.set(0,-length*i/last,0);previous[i].copy(p);});rope.asleep=true;
  }
}

// A velocity impulse keeps a scored basket on the same simulation as hand dragging.
export function kickLightRope(rope) {
  if (!rope) return;
  const last = rope.points.length - 1;
  for (let i = 1; i <= last; i++) {
    const weight = (i / last) ** 3;
    rope.previous[i].x -= .035 * weight;
    rope.previous[i].z += .018 * weight;
  }
  rope.asleep = false; rope.quiet = 0; rope.delay = 0;
}
