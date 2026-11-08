import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, SpotLight, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { createStationaryShadowCache } from '../components/workbench/shadowCache.mjs';

test('moving shadows are throttled, then refresh their final pose and return to idle', () => {
  const scene = new Scene(), light = new SpotLight();
  light.userData.cacheStationaryShadow = true;
  light.castShadow = true; light.shadow.map = {};
  const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial()); mesh.castShadow = true;
  scene.add(light, light.target, mesh);
  const cache = createStationaryShadowCache({ motionInterval: 1 / 30 });
  cache.update(scene, 1 / 120); light.shadow.needsUpdate = false;
  for (let i = 0; i < 3; i++) {
    light.position.x += .1; mesh.position.y += .1;
    assert.equal(cache.update(scene, 1 / 120), true);
    assert.equal(light.shadow.needsUpdate, false);
  }
  light.position.x += .1;
  cache.update(scene, 1 / 120);
  assert.equal(light.shadow.needsUpdate, true);
  light.shadow.needsUpdate = false;
  light.target.position.z += .1;
  assert.equal(cache.update(scene, 1 / 120), true);
  assert.equal(light.shadow.needsUpdate, false);
  assert.equal(cache.update(scene, 1 / 120), false);
  assert.equal(light.shadow.needsUpdate, true);
  light.shadow.needsUpdate = false;
  light.intensity = .25;
  assert.equal(cache.update(scene, 1 / 120), false);
  assert.equal(light.shadow.needsUpdate, false);
  cache.dispose(); mesh.geometry.dispose(); mesh.material.dispose();
  assert.equal(light.shadow.autoUpdate, true);
});
