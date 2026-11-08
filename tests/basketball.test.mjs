import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { HOOP, MOBILE_HOOP, hoopForWidth, crossedHoop, collideHoop, celebrationLight } from '../components/workbench/basketball.mjs';
import { createLightRope, kickLightRope, stepLightRope } from '../components/workbench/lightRope.mjs';

const at = (x=0,y=0,z=0) => new Vector3(HOOP.x+x, HOOP.y+y, HOOP.z+z);
test('scoring requires a downward crossing with full ball clearance, including fast diagonal shots',()=>{
  assert.equal(crossedHoop(at(0,1),at(0,-1),.24),true);
  assert.equal(crossedHoop(at(-1,1),at(1,-1),.24),true);
  assert.equal(crossedHoop(at(0,-1),at(0,1),.24),false);
  assert.equal(crossedHoop(at(0,-1),at(0,-2),.24),false);
  assert.equal(crossedHoop(at(HOOP.radius-.1,1),at(HOOP.radius-.1,-1),.24),false);
  assert.equal(crossedHoop(at(0,0),at(0,-1),.24),false);
});
test('rim rejects edge shots while allowing clear baskets, and backboard catches swept fast shots',()=>{
  const ball={position:at(HOOP.radius,.1),velocity:new Vector3(0,-5,0)};
  collideHoop(ball,at(HOOP.radius,.4),.24);
  assert.ok(ball.velocity.y>0);
  const swish={position:at(0,-.05),velocity:new Vector3(0,-5,0)};
  collideHoop(swish,at(0,.05),.24);
  assert.equal(swish.velocity.y,-5);
  const bank={position:new Vector3(-10,HOOP.boardY,HOOP.z),velocity:new Vector3(-20,0,0)};
  collideHoop(bank,new Vector3(-8,HOOP.boardY,HOOP.z),.24);
  assert.ok(bank.position.x>HOOP.boardX);
  assert.ok(bank.velocity.x>0);
});
test('celebration wakes the rope without moving its anchor or teleporting its shade',()=>{
  const rope=createLightRope(19.76,false);
  rope.asleep=true;
  const end=rope.points.at(-1).clone();
  kickLightRope(rope);
  assert.equal(rope.asleep,false);
  assert.deepEqual(rope.points.at(-1),end);
  stepLightRope(rope,1/60);
  assert.ok(rope.points.at(-1).x>0);
  assert.deepEqual(rope.points[0],new Vector3());
  for(let i=0;i<600;i++)stepLightRope(rope,1/60);
  assert.ok(rope.points.every(point=>point.toArray().every(Number.isFinite)));
});
test('lamp pulse restores original state and respects reduced motion',()=>{
  assert.equal(celebrationLight(1.4),null);
  assert.equal(celebrationLight(.2,true),null);
  assert.equal(celebrationLight(-1),null);
  for(let t=0;t<1.4;t+=.01)assert.ok(celebrationLight(t)>=.35 && celebrationLight(t)<=1);
});

test('mobile hoop sits right of the window and uses the same transformed scoring and backboard positions',()=>{
  assert.equal(hoopForWidth(760),MOBILE_HOOP);
  assert.equal(hoopForWidth(761).x,-7.85);
  assert.equal(hoopForWidth(761).y,2.5);
  assert.equal(hoopForWidth(761).z,-2.02);
  assert.equal(hoopForWidth(761).rotation,-92);
  assert.equal(hoopForWidth(761).size,.69);
  const h=MOBILE_HOOP;
  assert.ok(h.x-h.boardWidth/2>-2.9);
  const board=new Vector3(HOOP.boardX-HOOP.x,HOOP.boardY-HOOP.y,0)
    .applyAxisAngle(new Vector3(0,1,0),-Math.PI/2).add(new Vector3(h.x,h.y,h.z));
  assert.ok(board.distanceTo(new Vector3(h.boardX,h.boardY,h.boardZ))<1e-8);
  assert.equal(crossedHoop(new Vector3(h.x,h.y+1,h.z),new Vector3(h.x,h.y-1,h.z),.24,h),true);
  assert.equal(crossedHoop(at(0,1),at(0,-1),.24,h),false);
  const bank={position:new Vector3(h.x,h.boardY,-4),velocity:new Vector3(0,0,-20)};
  collideHoop(bank,new Vector3(h.x,h.boardY,-2),.24,h);
  assert.ok(bank.position.z>h.boardZ);
  assert.ok(bank.velocity.z>0);
});

test('position transforms move scoring and backboard together for each viewport',()=>{
  for (const width of [390,1440]) {
    const base=hoopForWidth(width);
    const profile=width===390?'mobile':'desktop';
    const moved=hoopForWidth(width,{[profile]:{x:base.x+1,y:base.y+.5,z:base.z+2,rotation:base.rotation,size:base.size}});
    assert.ok(Math.abs(moved.boardX-base.boardX-1)<1e-8);
    assert.equal(moved.boardY-base.boardY,.5);
    assert.ok(Math.abs(moved.boardZ-(base.boardZ??base.z)-2)<1e-8);
    assert.equal(crossedHoop(new Vector3(moved.x,moved.y+1,moved.z),new Vector3(moved.x,moved.y-1,moved.z),.24,moved),true);
  }
});

test('rotation and scale keep backboard collision aligned with the rendered hoop',()=>{
  const h=hoopForWidth(1440,{desktop:{x:-5,y:3,z:1,rotation:45,size:1.5}});
  assert.equal(h.radius,HOOP.radius*1.5);
  assert.equal(h.boardWidth,HOOP.boardWidth*1.5);
  const normal=new Vector3(Math.SQRT1_2,0,-Math.SQRT1_2),center=new Vector3(h.boardX,h.boardY,h.boardZ);
  const previous=center.clone().addScaledVector(normal,1);
  const body={position:center.clone().addScaledVector(normal,-1),velocity:normal.clone().multiplyScalar(-10)};
  collideHoop(body,previous,.24,h);
  assert.ok(body.velocity.dot(normal)>0);
  assert.ok(body.position.clone().sub(center).dot(normal)>=h.boardDepth/2+.24-1e-8);
});
