import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, DirectionalLight, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { preparePaperMeshes } from '../components/workbench/paperRendering.mjs';
import { createStationaryShadowCache } from '../components/workbench/shadowCache.mjs';

test('dragging held paper preserves shadow cache; thrown paper refreshes it', () => {
  const scene = new Scene();
  const light = new DirectionalLight();
  light.userData.cacheStationaryShadow = true;
  light.castShadow = true;
  light.shadow.map = {};
  const paper = new Mesh(new BoxGeometry(), new MeshStandardMaterial());
  preparePaperMeshes(paper, true);
  scene.add(light, paper);
  const cache = createStationaryShadowCache();
  cache.update(scene);
  light.shadow.needsUpdate = false;
  for (let i = 0; i < 60; i++) {
    paper.position.x += .01;
    cache.update(scene);
    assert.equal(light.shadow.needsUpdate, false);
  }
  assert.equal(paper.receiveShadow, false);
  preparePaperMeshes(paper, false);
  cache.update(scene);
  assert.equal(light.shadow.needsUpdate, true);
  assert.equal(paper.receiveShadow, true);
  light.shadow.needsUpdate = false;
  paper.position.y += .1;
  cache.update(scene);
  assert.equal(light.shadow.needsUpdate, true);
  cache.dispose();
  paper.geometry.dispose();
  paper.material.dispose();
});
