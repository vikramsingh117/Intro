import test from 'node:test';
import assert from 'node:assert/strict';
import { validNote, validId, publicNote } from '../lib/wall-notes.mjs';

test('wall input rejects operator objects, oversized text, and out-of-wall coordinates',()=>{
  const note={text:'Hello from the desk',x:0,y:2};
  assert.ok(validNote(note));
  for(const extra of [{text:{$gt:''}},{text:' '},{text:'a'.repeat(241)},{x:Infinity},{x:-3},{y:5},{y:'2'}])assert.ok(!validNote({...note,...extra}));
  assert.ok(validId('13d2cd98-aed0-4d94-9c5a-191f237eb21f'));
  assert.ok(!validId({$ne:null}));
});
test('public note data omits ownership secrets and exposes editing permission only to its owner',()=>{
  const doc={_id:'id',text:'Hello',x:0,y:2,ownerHash:'secret',createdAt:'now'};
  assert.equal(publicNote(doc,'secret').canEdit,true);
  assert.equal(publicNote(doc,'other').canEdit,false);
  assert.equal(publicNote(doc,null).canEdit,false);
  assert.ok(!('ownerHash' in publicNote(doc,'secret')));
});

test('API enforces ownership, validates writes, and makes create retries idempotent',async()=>{
  const {readFile}=await import('node:fs/promises');
  const documents=new Map();
  globalThis.wallNotesTestCollection={
    find:()=>({sort(){return this;},limit(){return this;},async toArray(){return [...documents.values()];}}),
    async findOne(filter){const doc=documents.get(filter._id);return doc?.ownerHash===filter.ownerHash?doc:null;},
    async updateOne(filter,update,options){
      const doc=documents.get(filter._id);
      if(doc?.ownerHash===filter.ownerHash){if(update.$set)Object.assign(doc,update.$set);return {matchedCount:1};}
      if(options?.upsert){if(doc)throw {code:11000};documents.set(filter._id,{...filter,...update.$setOnInsert});return {matchedCount:0};}
      return {matchedCount:0};
    },
    async deleteOne(filter){const doc=documents.get(filter._id);if(doc?.ownerHash!==filter.ownerHash)return {deletedCount:0};documents.delete(filter._id);return {deletedCount:1};},
  };
  let source=await readFile(new URL('../pages/api/wall-notes.js',import.meta.url),'utf8');
  source=source.replace("import { wallNotesCollection } from '../../lib/mongodb';",'const wallNotesCollection=async()=>globalThis.wallNotesTestCollection;').replace("'../../lib/wall-notes.mjs'",JSON.stringify(new URL('../lib/wall-notes.mjs',import.meta.url).href));
  const {default:handler}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  const owner=crypto.randomUUID(),other=crypto.randomUUID(),id=crypto.randomUUID();
  async function request(method,body,token=owner){const res={code:200,setHeader(){},status(value){this.code=value;return this;},json(value){this.data=value;return this;}};await handler({method,body,headers:{'content-type':'application/json',...(token?{'x-note-owner':token}:{})},socket:{remoteAddress:'test'}},res);return res;}
  try{
    assert.equal((await request('POST',{id,text:'Hello',x:0,y:2})).code,201);
    assert.equal((await request('POST',{id,text:'Retry',x:0,y:2})).code,201);
    assert.equal(documents.size,1);
    assert.equal((await request('GET')).data.notes[0].canEdit,true);
    assert.equal((await request('GET',null,other)).data.notes[0].canEdit,false);
    assert.equal((await request('PATCH',{id,text:'No',x:0,y:2},other)).code,404);
    assert.equal((await request('DELETE',{id},other)).code,404);
    assert.equal((await request('POST',{id,text:'No',x:0,y:2},other)).code,409);
    assert.equal((await request('PATCH',{id,text:'Moved',x:1,y:3})).code,200);
    assert.equal((await request('PATCH',{id,text:'Invalid',x:99,y:3})).code,400);
    assert.equal((await request('POST',{id,text:'No identity',x:0,y:2},null)).code,401);
    assert.equal((await request('DELETE',{id})).code,200);
    assert.equal(documents.size,0);
  }finally{delete globalThis.wallNotesTestCollection;}
});
