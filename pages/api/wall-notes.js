import { createHash } from 'crypto';
import { wallNotesCollection } from '../../lib/mongodb';
import { NOTE_LIMIT, publicNote, validId, validNote } from '../../lib/wall-notes.mjs';

export const config = { api: { bodyParser: { sizeLimit: '4kb' } } };
const requests = new Map();
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET','POST','PATCH','DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({error:'Method not allowed.'});
  }
  const token = req.headers['x-note-owner'];
  if (token !== undefined && !validId(token)) return res.status(400).json({error:'Invalid browser identity.'});
  const ownerHash = token ? createHash('sha256').update(token).digest('hex') : null;
  if (req.method !== 'GET') {
    if (!ownerHash) return res.status(401).json({error:'Browser identity is required.'});
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) return res.status(415).json({error:'JSON is required.'});
    const now = Date.now();
    for (const [key, value] of requests) if(now-value.start>=60000) requests.delete(key);
    const ip = process.env.VERCEL ? String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim() : req.socket.remoteAddress;
    const bucket = requests.get(ip) || {start:now,count:0};
    if (++bucket.count>30 || (!requests.has(ip) && requests.size>=10000)) {
      res.setHeader('Retry-After','60'); return res.status(429).json({error:'Please wait a minute before changing more notes.'});
    }
    requests.set(ip,bucket);
    if (!validId(req.body?.id) || (req.method !== 'DELETE' && !validNote(req.body))) return res.status(400).json({error:'Use a message of 1–240 characters and a spot on the wall.'});
  }
  try {
    const collection = await wallNotesCollection();
    if (req.method === 'GET') {
      const notes = await collection.find({}, {maxTimeMS:5000}).sort({createdAt:-1}).limit(NOTE_LIMIT).toArray();
      return res.status(200).json({notes:notes.map(note=>publicNote(note,ownerHash))});
    }
    const {id,text,x,y} = req.body;
    const filter = {_id:id,ownerHash};
    if (req.method === 'DELETE') {
      const result = await collection.deleteOne(filter);
      return result.deletedCount ? res.status(200).json({id}) : res.status(404).json({error:'This note is unavailable or belongs to another visitor.'});
    }
    if (req.method === 'POST') {
      // The client keeps the same id on retries, preventing duplicate notes.
      await collection.updateOne(filter, {$setOnInsert:{text:text.trim(),x,y,createdAt:new Date(),updatedAt:new Date()}}, {upsert:true});
    } else {
      const result = await collection.updateOne(filter, {$set:{text:text.trim(),x,y,updatedAt:new Date()}});
      if (!result.matchedCount) return res.status(404).json({error:'This note is unavailable or belongs to another visitor.'});
    }
    const note = await collection.findOne(filter);
    return res.status(req.method==='POST'?201:200).json({note:publicNote(note,ownerHash)});
  } catch (error) {
    if(error.code===11000) return res.status(409).json({error:'This note belongs to another visitor.'});
    return res.status(503).json({error:'The shared wall is unavailable right now. Please try again.'});
  }
}
