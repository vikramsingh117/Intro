import { notifyPhotoUpload } from '../../lib/photo-notifications';
import { createHash } from 'crypto';
import { Binary } from 'mongodb';
import { portfolioCollection } from '../../lib/mongodb';
import { validId } from '../../lib/wall-notes.mjs';
export const config={api:{bodyParser:{sizeLimit:'1mb'}}};
const writes=new Map();
function jpeg(value,maxBytes,maxSide){
  if(typeof value!=='string'||value.length>Math.ceil(maxBytes/3)*4||!/^\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(value))return null;
  const b=Buffer.from(value,'base64');
  if(b.length>maxBytes||b[0]!==255||b[1]!==216||b.at(-2)!==255||b.at(-1)!==217)return null;
  let p=2;
  while(p+4<b.length){
    if(b[p++]!==255)return null;
    while(b[p]===255)p++;
    const marker=b[p++];if(marker===218||marker===217)break;
    if(p+2>b.length)return null;
    const length=b.readUInt16BE(p);if(length<2||p+length>b.length)return null;
    if([192,193,194].includes(marker)){
      if(length<8)return null;
      const height=b.readUInt16BE(p+3),width=b.readUInt16BE(p+5);
      return width>0&&height>0&&width<=maxSide&&height<=maxSide?b:null;
    }
    p+=length;
  }
  return null;
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','POST','DELETE'].includes(req.method)){res.setHeader('Allow','GET, POST, DELETE');return res.status(405).json({error:'Method not allowed.'});}
  const token=req.headers['x-photo-owner'];
  if(token!==undefined&&!validId(token))return res.status(400).json({error:'Invalid browser identity.'});
  const ownerHash=token?createHash('sha256').update(token).digest('hex'):null;
  let image,thumbnail;
  if(req.method!=='GET'){
    if(!ownerHash)return res.status(401).json({error:'Browser identity is required.'});
    if(!String(req.headers['content-type']||'').startsWith('application/json')||!validId(req.body?.id))return res.status(400).json({error:'Invalid photo request.'});
    const now=Date.now();for(const [key,value]of writes)if(now-value.start>=3600000)writes.delete(key);
    const ip=process.env.VERCEL?String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].trim():req.socket.remoteAddress;
    const bucket=writes.get(ip)||{start:now,count:0};
    if(req.method==='POST'){
      if(bucket.count>=10||(!writes.has(ip)&&writes.size>=10000))return res.status(429).json({error:'Upload limit reached. Please try again in an hour.'});
      bucket.count++;writes.set(ip,bucket);
      image=jpeg(req.body.image,600000,1280);thumbnail=jpeg(req.body.thumbnail,70000,320);
      if(!image||!thumbnail)return res.status(400).json({error:'Please choose a smaller photo and try again.'});
    }
  }
  try{
    const collection=await portfolioCollection('photos');
    if(req.method==='GET'&&req.query.id!==undefined){
      if(!validId(req.query.id))return res.status(400).json({error:'Invalid photo.'});
      const field=req.query.thumb==='1'?'thumbnail':'image';
      const photo=await collection.findOne({_id:req.query.id},{projection:{[field]:1},maxTimeMS:5000});
      if(!photo)return res.status(404).json({error:'Photo unavailable.'});
      const bytes=Buffer.isBuffer(photo[field])?photo[field]:Buffer.from(photo[field].buffer);
      res.setHeader('Content-Type','image/jpeg');return res.status(200).send(bytes);
    }
    if(req.method==='GET'){
      let filter={};
      if(req.query.before!==undefined){
        if(typeof req.query.before!=='string')return res.status(400).json({error:'Invalid page.'});
        const [date,id]=req.query.before.split('_'),time=new Date(date);
        if(!validId(id)||Number.isNaN(time.getTime()))return res.status(400).json({error:'Invalid page.'});
        filter={$or:[{createdAt:{$lt:time}},{createdAt:time,_id:{$lt:id}}]};
      }
      const results=await collection.find(filter,{projection:{createdAt:1,ownerHash:1},maxTimeMS:5000}).sort({createdAt:-1,_id:-1}).limit(41).toArray();
      const photos=results.slice(0,40),last=photos.at(-1);
      return res.status(200).json({photos:photos.map(p=>({id:p._id,createdAt:p.createdAt,canDelete:!!ownerHash&&p.ownerHash===ownerHash})),next:results.length>40?`${last.createdAt.toISOString()}_${last._id}`:null});
    }
    const filter={_id:req.body.id,ownerHash};
    if(req.method==='DELETE'){
      const result=await collection.deleteOne(filter);
      return result.deletedCount?res.status(200).json({id:req.body.id}):res.status(404).json({error:'Photo unavailable or belongs to another visitor.'});
    }
    const result=await collection.updateOne(filter,{$setOnInsert:{image:new Binary(image),thumbnail:new Binary(thumbnail),createdAt:new Date()}},{upsert:true});
    if(result.upsertedCount===1)await notifyPhotoUpload(req.body.id);
    return res.status(201).json({id:req.body.id});
  }catch(error){return res.status(error.code===11000?409:503).json({error:error.code===11000?'Photo ID already exists.':'The shared gallery is unavailable. Please try again.'});}
}
