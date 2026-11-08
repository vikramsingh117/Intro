import test from 'node:test';
import assert from 'node:assert/strict';
import { noteBoundsForWidth, clampNotePosition, notePlacementRect, NOTE_HALF_SIZE } from '../components/workbench/notePlacement.mjs';
import { HOOP, MOBILE_HOOP } from '../components/workbench/basketball.mjs';

test('mobile placement rectangle and entire notes stay right of the hoop',()=>{
  const bounds=noteBoundsForWidth(390), rectangle=notePlacementRect(bounds);
  const hoopRight=MOBILE_HOOP.x+Math.max(MOBILE_HOOP.radius,MOBILE_HOOP.boardWidth/2);
  assert.ok(rectangle.x-rectangle.width/2>hoopRight);
  const position=clampNotePosition(-20,20,bounds);
  assert.ok(position.x-NOTE_HALF_SIZE>hoopRight);
  assert.equal(position.y,4.7);
  assert.ok(Math.abs(rectangle.x+rectangle.width/2-(6+NOTE_HALF_SIZE))<1e-8);
  assert.deepEqual(clampNotePosition(.85,4.5179719660477655,bounds),{x:.85,y:4.5179719660477655});
});
test('desktop keeps its full sticker area and only mobile has the smaller board',()=>{
  const bounds=noteBoundsForWidth(1440),rectangle=notePlacementRect(bounds);
  assert.equal(bounds.minX,-2.25);
  assert.equal(rectangle.x,1.875);
  assert.equal(rectangle.width,8.97);
  assert.equal(MOBILE_HOOP.boardWidth,HOOP.boardWidth/2);
  assert.equal(MOBILE_HOOP.boardHeight,HOOP.boardHeight/2);
  assert.equal(MOBILE_HOOP.radius,HOOP.radius);
});
