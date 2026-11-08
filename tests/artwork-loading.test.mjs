import test from 'node:test';
import assert from 'node:assert/strict';
import { loadArtworkImage } from '../components/workbench/loadArtwork.mjs';

test('SVG onload still supplies artwork when decode rejects', async()=>{
  const image={width:1454,naturalWidth:1454,complete:false,decode:()=>Promise.reject(new Error('SVG decode unsupported')),
    set src(value){this.url=value;queueMicrotask(()=>{this.complete=true;this.onload?.();});}};
  assert.equal(await loadArtworkImage('/app.svg',()=>image),image);
  assert.equal(image.fetchPriority,'low');
  assert.equal(image.onload,null);
});
test('cached decoded SVG supplies artwork without waiting for onload',async()=>{
  const image={width:1454,decode:()=>Promise.resolve()};
  assert.equal(await loadArtworkImage('/app.svg',()=>image),image);
});
test('failed and stalled frames resolve so later pages can load',async()=>{
  const failed={set src(value){queueMicrotask(()=>this.onerror?.());}};
  assert.equal(await loadArtworkImage('/failed.svg',()=>failed),null);
  assert.equal(await loadArtworkImage('/stalled.svg',()=>({}),5),null);
});
