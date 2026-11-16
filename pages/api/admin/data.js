// Serves authenticated, read-only observability queries for the allowlisted admin collections.
// Search fields and sort keys are mapped server-side so the terminal UI cannot inject arbitrary MongoDB operators.
import { authenticated } from '../../../lib/admin-auth';
import { portfolioCollection } from '../../../lib/mongodb';
import { isIP } from 'net';
const collections = new Set(['chatbot_requests', 'visitor_activity', 'visitor_totals', 'wall_notes', 'photos']);
const collectionOptions = {
  chatbot_requests: { search: ['prompt', 'response', 'error', 'model'], sorts: { newest: '_id', created: 'createdAt', duration: 'durationMs' }, defaultSort: 'newest' },
  visitor_activity: { search: ['ip', 'state', 'country', 'landingPath', 'events.action', 'events.target', 'events.path'], sorts: { lastSeen: 'lastSeen', firstSeen: 'firstSeen', visits: 'visits', active: 'activeSeconds', interactions: 'events' }, defaultSort: 'lastSeen' },
  visitor_totals: { search: ['ip', 'state', 'country', 'regionCode', 'landingPath'], sorts: { lastSeen: 'lastSeen', firstSeen: 'firstSeen', landings: 'landingCount', active: 'activeSeconds' }, defaultSort: 'lastSeen' },
  wall_notes: { search: ['text'], sorts: { newest: '_id', created: 'createdAt', updated: 'updatedAt' }, defaultSort: 'newest' },
  photos: { search: ['caption', 'mimeType'], sorts: { newest: '_id', created: 'createdAt' }, defaultSort: 'newest' },
};
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function searchFilter(fields, query) {
  if (!query) return {};
  const pattern = new RegExp(escapeRegex(query), 'i');
  return { $or: fields.map(field => ({ [field]: pattern })) };
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  // Authenticate before resolving or querying any collection.
  if (!authenticated(req)) return res.status(401).json({ error: 'Session expired. Sign in again from Terminal.' });
  const { collection, page = '0', q = '', sort, direction = 'desc' } = req.query;
  if (!collections.has(collection) || typeof page !== 'string' || !/^\d{1,4}$/.test(page) || typeof q !== 'string' || q.length > 80 || typeof direction !== 'string' || !['asc', 'desc'].includes(direction)) return res.status(400).json({ error: 'Invalid admin query.' });
  const options = collectionOptions[collection];
  const sortKey = typeof sort === 'string' && options.sorts[sort] ? sort : options.defaultSort;
  const sortField = options.sorts[sortKey], sortDirection = direction === 'asc' ? 1 : -1;
  const query = q.trim();
  try {
    const db = await portfolioCollection(collection);
    if (collection === 'visitor_activity') {
      const { ip } = req.query;
      if (ip !== undefined && (typeof ip !== 'string' || !isIP(ip))) return res.status(400).json({ error: 'Invalid IP address.' });
      const recent = { $ifNull: ['$lastSeen', '$landedAt'] };
      if (ip !== undefined) {
        const visits = await db.aggregate([
          { $match: { ip } },
          { $set: { lastSeen: recent } },
          { $sort: { lastSeen: -1, _id: -1 } },
          { $skip: Number(page) * 10 }, { $limit: 11 },
          { $project: { ownerHash: 0 } },
        ], { maxTimeMS: 5000 }).toArray();
        return res.status(200).json({ records: visits.slice(0, 10), hasNext: visits.length > 10 });
      }
      const filter = searchFilter(options.search, query);
      const [result] = await db.aggregate([
        ...(query ? [{ $match: filter }] : []),
        { $project: { ip: 1, state: 1, country: 1, landedAt: 1, lastSeen: recent,
          durationSeconds: 1, activeSeconds: 1, eventCount: { $size: { $ifNull: ['$events', []] } } } },
        { $sort: { lastSeen: -1, _id: -1 } },
        { $group: { _id: '$ip', lastSeen: { $first: '$lastSeen' }, firstSeen: { $min: '$landedAt' },
          state: { $first: '$state' }, country: { $first: '$country' }, visits: { $sum: 1 },
          durationSeconds: { $sum: '$durationSeconds' }, activeSeconds: { $sum: '$activeSeconds' }, events: { $sum: '$eventCount' } } },
        { $facet: {
          records: [{ $sort: { [sortField]: sortDirection, _id: 1 } }, { $skip: Number(page) * 25 }, { $limit: 26 }],
          totals: [{ $group: { _id: null, ips: { $sum: 1 }, visits: { $sum: '$visits' }, activeSeconds: { $sum: '$activeSeconds' } } }],
        } },
      ], { maxTimeMS: 5000, allowDiskUse: true }).toArray();
      return res.status(200).json({ records: result.records.slice(0, 25), hasNext: result.records.length > 25, totals: result.totals[0] || { ips: 0, visits: 0, activeSeconds: 0 }, meta: { query, sort: sortKey, direction } });
    }
    const filter = searchFilter(options.search, query);
    const records = await db.find(filter, { projection: { image: 0, thumbnail: 0, ownerHash: 0 }, maxTimeMS: 5000 })
      .sort({ [sortField]: sortDirection, _id: sortDirection }).skip(Number(page) * 25).limit(26).toArray();
    return res.status(200).json({ records: records.slice(0, 25), hasNext: records.length > 25, meta: { query, sort: sortKey, direction } });
  } catch { return res.status(503).json({ error: 'Database unavailable. Try refreshing.' }); }
}
