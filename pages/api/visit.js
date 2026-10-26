import { createHash } from 'crypto';
import { isIP } from 'net';
import { portfolioCollection } from '../../lib/mongodb';
import { validId } from '../../lib/wall-notes.mjs';
import { INDIA_REGIONS } from '../../lib/india-regions';
import { notifyIndiaVisit } from '../../lib/photo-notifications';
export const config={api:{bodyParser:{sizeLimit:'16kb'}}};
const paths=new Set(['/','/simple','/after-hours','/workbench']);
const buckets=new Map();
let indexes;
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).end();}
  // Preview deployments and local development should not pollute production analytics.
  if(process.env.VERCEL_ENV!=='production')return res.status(204).end();
  if(/bot|crawler|spider|headless/i.test(String(req.headers['user-agent']||'')))return res.status(204).end();
  let origin;try{origin=new URL(req.headers.origin).host;}catch{return res.status(403).end();}
  if(origin!==req.headers.host||req.headers['sec-fetch-site']==='cross-site')return res.status(403).end();
  const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'').split(',')[0].trim();
  if(!isIP(ip))return res.status(204).end();
  const visitorId=createHash('sha256').update(ip).digest('hex');
  const now=Date.now();for(const [key,b]of buckets)if(now-b.start>60000)buckets.delete(key);
  const bucket=buckets.get(visitorId)||{start:now,count:0};
  if(bucket.count>=90||(!buckets.has(visitorId)&&buckets.size>=10000))return res.status(429).end();
  bucket.count++;buckets.set(visitorId,bucket);
  const {visitId,landingPath,events,durationSeconds=0,activeSeconds=0}=req.body||{};
  if(!validId(visitId)||!paths.has(landingPath)||!Array.isArray(events)||events.length>25)return res.status(400).end();
  if(events.some(e=>!e||!validId(e.id)||!paths.has(e.path)||typeof e.action!=='string'||! /^[a-z_]{1,48}$/.test(e.action)||typeof e.target!=='string'||e.target.length>100||typeof e.at!=='string'||!Number.isFinite(Date.parse(e.at))))return res.status(400).end();
  if(!Number.isSafeInteger(durationSeconds)||durationSeconds<0||durationSeconds>31536000||!Number.isSafeInteger(activeSeconds)||activeSeconds<0||activeSeconds>durationSeconds)return res.status(400).end();
  const clean=events.map(({id,action,target,path,at})=>({id,action,target,path,at}));
  const country=String(req.headers['x-vercel-ip-country']||'').slice(0,2);
  const regionCode=String(req.headers['x-vercel-ip-country-region']||'').replace(/^IN-/,'').slice(0,8);
  const state=country==='IN'?(INDIA_REGIONS[regionCode]||null):null;
  try{
    const visits=await portfolioCollection('visitor_activity');
    const visitors=await portfolioCollection('visitor_totals');
    if(!indexes)indexes=visits.createIndex({visitorId:1,landedAt:-1}).catch(error=>{indexes=null;throw error;});
    await indexes;
    const result=await visits.updateOne({_id:visitId,visitorId},{$setOnInsert:{visitorId,ip,country,regionCode,state,landingPath,landedAt:new Date(),events:[]}},{upsert:true});
    // Replayed batches are idempotent. Bound the document size for long-running tabs.
    await visits.updateOne({_id:visitId,visitorId},[{$set:{lastSeen:new Date(),durationSeconds:{$max:[{$ifNull:['$durationSeconds',0]},durationSeconds]},activeSeconds:{$max:[{$ifNull:['$activeSeconds',0]},activeSeconds]},events:{$slice:[{$setUnion:['$events',{$literal:clean}]},1000]}}}]);
    if(result.upsertedCount===1){
      const landingCount=await visits.countDocuments({visitorId});
      await visitors.updateOne({_id:visitorId},{$set:{ip,country,regionCode,state,lastSeen:new Date()},$setOnInsert:{firstSeen:new Date()},$max:{landingCount}},{upsert:true});
      if(country==='IN')await notifyIndiaVisit(state);
    }
    return res.status(204).end();
  }catch{return res.status(503).end();}
}
