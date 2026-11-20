import https from 'https';

const USER_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
function requestJSON(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'vikram-portfolio-activity-board' } }, response => {
      let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });
      response.on('end', () => response.statusCode === 200 ? resolve(JSON.parse(body)) : reject(new Error(`GitHub returned ${response.statusCode}`)));
    });
    request.setTimeout(7000, () => request.destroy(new Error('GitHub request timed out'))); request.on('error', reject);
  });
}
const requestEvents = user => requestJSON(`https://api.github.com/users/${user}/events/public?per_page=100`);
const eventType = type => type.replace(/Event$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
const eventTime = value => new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
async function eventDetail(event) {
  const base = { time: eventTime(event.created_at), type: eventType(event.type), repo: event.repo.name, description: event.type === 'PushEvent' ? 'Pushed to the repository' : 'Public GitHub activity' };
  if (event.type !== 'PushEvent' || !event.payload.head) return base;
  try {
    const commit = await requestJSON(`https://api.github.com/repos/${event.repo.name}/commits/${event.payload.head}`);
    return { ...base, message: commit.commit?.message?.split('\n')[0], description: `Commit ${event.payload.head.slice(0, 7)} · ${event.payload.ref?.replace('refs/heads/', '') || 'branch'}` };
  } catch { return { ...base, description: `Commit ${event.payload.head.slice(0, 7)} · message unavailable` }; }
}
export default async function handler(req, res) {
  const user = typeof req.query.user === 'string' ? req.query.user : 'vikramsingh117';
  if (!USER_PATTERN.test(user)) return res.status(400).json({ error: 'Invalid GitHub user.' });
  try {
    const events = await requestEvents(user);
    const date = typeof req.query.date === 'string' ? req.query.date : '';
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Invalid date.' });
    if (date) {
      const allMatching = events.filter(event => event.created_at?.slice(0, 10) === date);
      const details = await Promise.all(allMatching.slice(0, 8).map(eventDetail));
      res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
      return res.status(200).json({ events: details, truncated: details.length < allMatching.length });
    }
    const days = events.reduce((result, event) => { const date = event.created_at?.slice(0, 10); if (date) result[date] = (result[date] || 0) + 1; return result; }, {});
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    res.status(200).json({ activity: Object.entries(days).map(([date, count]) => ({ date, count })) });
  } catch { res.status(502).json({ error: 'GitHub activity is temporarily unavailable.' }); }
}
