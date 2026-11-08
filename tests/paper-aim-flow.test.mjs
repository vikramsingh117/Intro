import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Spherical, Vector3 } from 'three';
import { paperPickupProgress, PAPER_PICKUP_SECONDS, rotatePaperCamera } from '../components/workbench/paperAim.mjs';
import { refillPage } from '../components/workbench/paperInventoryState.mjs';

test('ready-ball camera rotation preserves distance and respects room wall and vertical limits', () => {
  const camera = new PerspectiveCamera(); camera.position.set(6,3.5,14.8);
  const orbit = {target:new Vector3(0,.2128,-.51), rotateSpeed:.55, minAzimuthAngle:-22*Math.PI/180, maxAzimuthAngle:1.2, minPolarAngle:.75, maxPolarAngle:1.55};
  const distance=camera.position.distanceTo(orbit.target), original=camera.position.clone();
  rotatePaperCamera(camera,orbit,30,15,900);
  assert.ok(camera.position.distanceTo(original)>.1);
  assert.ok(Math.abs(camera.position.distanceTo(orbit.target)-distance)<1e-8);
  rotatePaperCamera(camera,orbit,100000,100000,900);
  let spherical=new Spherical().setFromVector3(camera.position.clone().sub(orbit.target));
  assert.ok(Math.abs(spherical.theta-orbit.minAzimuthAngle)<1e-8);
  assert.ok(Math.abs(spherical.phi-orbit.minPolarAngle)<1e-8);
  rotatePaperCamera(camera,orbit,-100000,-100000,900);
  spherical.setFromVector3(camera.position.clone().sub(orbit.target));
  assert.ok(Math.abs(spherical.theta-orbit.maxAzimuthAngle)<1e-8);
  assert.ok(Math.abs(spherical.phi-orbit.maxPolarAngle)<1e-8);
  const direction=camera.getWorldDirection(new Vector3());
  assert.ok(direction.dot(orbit.target.clone().sub(camera.position).normalize())>.999999);
});

test('pickup animation finishes quickly and reduced motion readies immediately', () => {
  assert.equal(paperPickupProgress(0,false),0);
  assert.ok(paperPickupProgress(PAPER_PICKUP_SECONDS/2,false)>.5);
  assert.equal(paperPickupProgress(PAPER_PICKUP_SECONDS,false),1);
  assert.equal(paperPickupProgress(5,false),1);
  assert.equal(paperPickupProgress(0,true),1);
});

test('empty inventory opens the instructions first, skips torn pages, and handles a fully torn notebook', () => {
  assert.equal(refillPage(8,3,[]),3);
  assert.equal(refillPage(8,3,[0,1]),3);
  assert.equal(refillPage(8,3,[3,4]),5);
  assert.equal(refillPage(8,3,[3,4,5,6,7]),0);
  assert.equal(refillPage(8,3,[0,1,2,3,4,5,6,7]),null);
});
