import test from 'node:test';
import assert from 'node:assert/strict';
import { PlaneGeometry } from 'three';
import { nextNotebookPage, notebookTurnLeaves, visibleLeftPage, tornEdgeWidth, deformTearingPage } from '../components/workbench/notebookPaper.mjs';

test('turns skip consecutive removed leaves in both directions as one bundle', () => {
  const torn = [1, 2, 3];
  assert.equal(nextNotebookPage(0, 1, torn, 10), 4);
  assert.equal(nextNotebookPage(4, -1, torn, 10), 0);
  assert.deepEqual(notebookTurnLeaves(4, 0), [0, 1, 2, 3]);
  assert.deepEqual(notebookTurnLeaves(0, 4), [0, 1, 2, 3]);
  assert.equal(visibleLeftPage(4, torn), 1);
});

test('successive tears expose new sheets and exhausted ends stay in bounds', () => {
  const torn = [];
  let page = 0;
  for (let i = 0; i < 10; i++) {
    assert.equal(page, i);
    torn.push(page);
    page = nextNotebookPage(page, 1, torn, 10);
  }
  assert.equal(page, 9);
  assert.equal(nextNotebookPage(page, -1, torn, 10), 9);
  assert.equal(nextNotebookPage(0, -1, [], 10), 0);
});

test('each remnant is distinct and the peeling edge matches its page', () => {
  const profiles = new Set();
  for (let page = 0; page < 10; page++) {
    profiles.add(JSON.stringify(Array.from({length: 25}, (_, i) => tornEdgeWidth(page, i / 24))));
    const geometry = new PlaneGeometry(1.1, 1.55, 16, 32);
    deformTearingPage(geometry, 1, page);
    const positions = geometry.attributes.position;
    assert.ok(Math.abs(positions.getX(0) - (-.55 + tornEdgeWidth(page, 1) + .28)) < 1e-6);
    assert.ok([...positions.array].every(Number.isFinite));
    deformTearingPage(geometry, 0, page);
    assert.ok(Math.abs(positions.getX(0) + .55) < 1e-6);
    geometry.dispose();
  }
  assert.equal(profiles.size, 10);
});
