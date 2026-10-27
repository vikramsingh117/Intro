import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const COOKIE = 'portfolio_admin';
const TTL = 15 * 60;
const attempts = new Map();
export function configured() {
  return !!process.env.ADMIN_PASSWORD_HASH && !!process.env.ADMIN_SESSION_SECRET;
}
export function sameOrigin(req) {
  try { return new URL(req.headers.origin).host === req.headers.host && req.headers['sec-fetch-site'] !== 'cross-site'; }
  catch { return false; }
}
export function rateLimited(req) {
  const key = process.env.VERCEL === '1' ? String(req.headers['x-vercel-forwarded-for'] || 'unknown').split(',')[0] : req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  for (const [id, bucket] of attempts) if (bucket.until <= now) attempts.delete(id);
  if (!attempts.has(key) && attempts.size >= 10000) return true;
  const bucket = attempts.get(key) || { count: 0, until: now + 15 * 60000 };
  bucket.count++;
  attempts.set(key, bucket);
  return bucket.count > 5;
}
export function validPassword(password) {
  if (typeof password !== 'string' || password.length > 128) return false;
  const [salt, hash] = process.env.ADMIN_PASSWORD_HASH.split(':');
  if (!salt || !/^[a-f0-9]{128}$/.test(hash || '')) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}
function sign(value) { return createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(value).digest('hex'); }
export function setSession(res, clear = false) {
  const value = `${Date.now() + TTL * 1000}.${randomBytes(16).toString('hex')}`;
  const token = clear ? '' : `${value}.${sign(value)}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${clear ? 0 : TTL}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
export function authenticated(req) {
  if (!configured()) return false;
  const token = req.cookies?.[COOKIE] || '';
  const [expires, nonce, signature] = token.split('.');
  if (!/^\d+$/.test(expires || '') || !/^[a-f0-9]{32}$/.test(nonce || '') || !/^[a-f0-9]{64}$/.test(signature || '') || Number(expires) <= Date.now()) return false;
  return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(sign(`${expires}.${nonce}`), 'hex'));
}
