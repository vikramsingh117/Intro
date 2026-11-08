import test from 'node:test';
import assert from 'node:assert/strict';
import { initialPaperInventory, consumePaper, STARTING_PAPER_COUNT, pilePosition, PAPER_PILE_ORIGIN, PAPER_RADIUS } from '../components/workbench/paperInventoryState.mjs';

test('three starter balls and torn pages form one queue that can be thrown continuously', () => {
  let inventory = initialPaperInventory();
  assert.equal(inventory.length, 3);
  assert.equal(new Set(inventory.map(ball=>ball.id)).size, 3);
  inventory = [...inventory, {id: STARTING_PAPER_COUNT+1, page: 2}];
  const original = inventory;
  for (const id of [1,2,3,4]) {
    assert.equal(inventory[0].id, id);
    inventory = consumePaper(inventory, id);
    assert.equal(inventory.length, 4-id);
    assert.equal(consumePaper(inventory, id), inventory, 'duplicate releases cannot consume the next ball');
  }
  assert.equal(original.length, 4, 'queue updates do not mutate prior state');
  assert.equal(consumePaper(inventory, 999), inventory);
  inventory = [...inventory, {id:5,page:3}];
  assert.equal(inventory[0].id, 5, 'tearing after exhaustion refills the pile');
});

test('pile has one distinct slot per ball and stacks above the desktop', () => {
  const positions = Array.from({length:24},(_,i)=>pilePosition(i));
  assert.equal(new Set(positions.map(p=>p.join(','))).size,24);
  assert.ok(positions.every(p=>p.every(Number.isFinite)));
  assert.ok(positions.every(p=>p[1]+PAPER_PILE_ORIGIN[1]-PAPER_RADIUS>=-1.5));
  assert.equal(positions[0][1],0);
  assert.ok(positions[6][1]>positions[0][1]);
});
