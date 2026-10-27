import { configured, sameOrigin, rateLimited, validPassword, setSession } from '../../../lib/admin-auth';
export const config = { api: { bodyParser: { sizeLimit: '1kb' } } };
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['POST', 'DELETE'].includes(req.method)) { res.setHeader('Allow', 'POST, DELETE'); return res.status(405).end(); }
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Request not allowed.' });
  if (req.method === 'DELETE') { setSession(res, true); return res.status(204).end(); }
  if (!configured()) return res.status(503).json({ error: 'Admin access is not configured on this server.' });
  if (rateLimited(req)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  if (!validPassword(req.body?.password)) return res.status(401).json({ error: 'Incorrect password.' });
  setSession(res);
  return res.status(200).json({ authenticated: true });
}
