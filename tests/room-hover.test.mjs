import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, Mesh, BoxGeometry, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { createRoomBounds, installObjectHover, isRoomHover } from '../components/workbench/roomHover.mjs';

test('hover uses one stable target without visiting child meshes; clicks retain their targets', () => {
  const root = new Group();
  const geometry = new BoxGeometry(), material = new MeshBasicMaterial();
  let childPicks = 0;
  const children = [-1, 1].map(x => {
    const mesh = new Mesh(geometry, material);
    mesh.position.x = x;
    const pick = mesh.raycast;
    mesh.raycast = function(...args) { childPicks++; return pick.apply(this, args); };
    root.add(mesh);
    return mesh;
  });
  const bounds = createRoomBounds(root);
  const restore = installObjectHover(root, bounds.box);
  const raycaster = new Raycaster(new Vector3(-1, 0, 5), new Vector3(0, 0, -1));
  raycaster.roomHoverOnly = true;
  for (const x of [-1, 0, 1]) {
    raycaster.ray.origin.x = x;
    const hits = raycaster.intersectObject(root, true);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].object, root);
  }
  assert.equal(childPicks, 0);
  raycaster.roomHoverOnly = false;
  assert.equal(raycaster.intersectObject(root, true)[0].object, children[1]);
  assert.ok(childPicks > 0);
  raycaster.ray.origin.x = 0;
  assert.equal(raycaster.intersectObject(root, true).length, 0, 'clicking between the meshes remains a miss');
  restore();
  raycaster.roomHoverOnly = true;
  raycaster.ray.origin.x = -1;
  assert.equal(raycaster.intersectObject(root, true)[0].object, children[0]);
  geometry.dispose(); material.dispose();
});

test('bounds refresh only for movement, deformation, or changed children', () => {
  const root = new Group(), mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  root.add(mesh);
  const bounds = createRoomBounds(root);
  const box = bounds.box;
  for (let i = 0; i < 100; i++) assert.equal(bounds.update(), false);
  mesh.position.x = 2;
  assert.equal(bounds.update(), true);
  assert.equal(box.min.x, 1.5);
  assert.equal(bounds.update(), false);
  const position = mesh.geometry.attributes.position;
  for (let i = 0; i < position.count; i++) position.setX(i, position.getX(i) * 2);
  position.needsUpdate = true;
  assert.equal(bounds.update(), true);
  assert.equal(box.min.x, 1);
  assert.equal(bounds.update(), false);
  root.remove(mesh);
  assert.equal(bounds.update(), true);
  assert.equal(box.isEmpty(), true);
  mesh.geometry.dispose(); mesh.material.dispose();
});

test('only free mouse or pen movement uses coarse hover bounds', () => {
  const hover = { type: 'pointermove', buttons: 0, pointerType: 'mouse' };
  assert.equal(isRoomHover(hover), true);
  assert.equal(isRoomHover({...hover, buttons: 1}), false);
  assert.equal(isRoomHover(hover, true), false);
  assert.equal(isRoomHover({...hover, type: 'click'}), false);
  assert.equal(isRoomHover({...hover, type: 'pointerdown'}), false);
  assert.equal(isRoomHover({...hover, pointerType: 'touch'}), false);
});
