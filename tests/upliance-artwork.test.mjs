import test from 'node:test';
import assert from 'node:assert/strict';
import { UPLIANCE_ARTWORK, selectArtwork, drawUplianceWork } from '../components/workbench/uplianceArtwork.mjs';

test('out-of-order loading never shows another page’s images',()=>{
  const images={};
  for(const page of [...UPLIANCE_ARTWORK].reverse())for(const url of [...page.urls].reverse())images[url]={url,width:1454,height:1510};
  for(const [index,page] of UPLIANCE_ARTWORK.entries())for(let frame=0;frame<Math.max(1,page.urls.length);frame++){
    assert.equal(selectArtwork(images,index,frame)?.url,page.urls[frame]);
  }
  assert.equal(selectArtwork({[UPLIANCE_ARTWORK[0].urls[0]]:images[UPLIANCE_ARTWORK[0].urls[0]]},1,0),null);
  assert.ok(selectArtwork(images,1,0).url.includes('/upliance-app-sequence/'));
});
test('text stays in its column before and after artwork loads, with room above the footer',()=>{
  const texts=[],draws=[];
  const ctx={font:'29px sans-serif',fillRect(){},measureText(text){return {width:text.length*parseFloat(this.font)*.53};},
    fillText(text,x,y){texts.push({text,x,y,width:this.measureText(text).width});},drawImage(...args){draws.push(args);}};
  const page={title:'Cooking, made personal',subtitle:'01 / upliance app',lines:['Built dynamic recipe categories','to make discovery easier in the app.','Shaped the touchscreen UI and navigation.','','Added diet and allergen preferences,','with reliable scroll restoration.','React web UI inside an Android WebView.']};
  drawUplianceWork(ctx,page,1,null,true);
  const before=texts.slice();texts.length=0;
  drawUplianceWork(ctx,page,1,{width:1454,height:1510},true);
  assert.deepEqual(texts,before);
  assert.ok(texts.filter(t=>t.y>=204).every(t=>t.x+t.width<=585&&t.y<670));
  assert.equal(draws.length,1);
  assert.ok(draws[0][2]<180);
  assert.ok(draws[0][4]>460);
  assert.ok(draws[0][1]>=610);
});
