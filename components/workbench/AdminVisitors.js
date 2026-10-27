import { useEffect, useState } from 'react';
import styles from '../../styles/AdminView.module.css';
const format = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
function time(value) { return value && Number.isFinite(Date.parse(value)) ? format.format(new Date(value)) : 'Unavailable'; }
function duration(value = 0) {
  const seconds = Math.max(0, Math.floor(value));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;
}
function Visits({ ip, onExpired }) {
  const [page, setPage] = useState(0), [retry, setRetry] = useState(0);
  const [data, setData] = useState(null), [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError('');
    fetch(`/api/admin/data?collection=visitor_activity&ip=${encodeURIComponent(ip)}&page=${page}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const result = await response.json();
        if (controller.signal.aborted) return;
        if (response.status === 401) { onExpired(); return; }
        if (!response.ok) throw Error(result.error || 'Could not load visits.');
        setData(result);
      }).catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [ip, page, retry, onExpired]);
  return <div className={styles.visitList}>
    {!data && !error && <p role="status">Loading visits…</p>}
    {error && <div role="alert">{error} <button onClick={() => setRetry(value => value + 1)}>Retry</button></div>}
    {data && <>
      {!data.records.length && <p>No visits on this page.</p>}
      {data.records.map(visit => <article className={styles.visit} key={visit._id}>
        <div className={styles.visitHeading}><strong>{visit.landingPath || 'Unknown entry page'}</strong><span>{time(visit.landedAt)} IST</span></div>
        <p>Last seen {time(visit.lastSeen)} IST · {duration(visit.activeSeconds)} active · {duration(visit.durationSeconds)} elapsed</p>
        <details><summary>Activity timeline · {visit.events?.length || 0} events</summary>
          {!visit.events?.length ? <p>No recorded interactions.</p> : <ol className={styles.timeline}>{[...visit.events].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).map((event, index) => <li key={`${event.id}-${index}`}>
            <time>{time(event.at)} IST</time><div><strong>{String(event.action || 'Interaction').replace(/_/g, ' ')}</strong>{event.target && <span>{event.target}</span>}<code>{event.path}</code></div>
          </li>)}</ol>}
        </details>
      </article>)}
      <nav aria-label={`Visits for ${ip}`}><button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Newer visits</button><span>Visit page {page + 1}</span><button disabled={!data.hasNext || page === 9999} onClick={() => setPage(value => value + 1)}>Older visits</button></nav>
    </>}
  </div>;
}
export default function AdminVisitors({ data, onExpired }) {
  const [expanded, setExpanded] = useState(null);
  return <div>
    <div className={styles.visitorTitle}><h3>Visitor activity</h3><p>Grouped by IP · most recently seen first · all times IST</p></div>
    <div className={styles.stats}>
      <div><span>IP addresses</span><strong>{data.totals.ips.toLocaleString('en-IN')}</strong></div>
      <div><span>Total visits</span><strong>{data.totals.visits.toLocaleString('en-IN')}</strong></div>
      <div><span>Recorded active time</span><strong>{duration(data.totals.activeSeconds)}</strong></div>
    </div>
    <p className={styles.caption}>An IP can represent multiple people. Active time is estimated from visible tabs.</p>
    {!data.records.length && <p className={styles.empty}>No visitor activity on this page.</p>}
    {data.records.map((visitor, index) => <article className={styles.visitorCard} key={visitor._id || 'unknown'}>
      <button className={styles.visitorToggle} aria-expanded={expanded === index} aria-controls={`visitor-details-${index}`} onClick={() => setExpanded(expanded === index ? null : index)}>
        <div><strong>{visitor._id || 'Unknown IP'}</strong><span>{[visitor.state, visitor.country].filter(Boolean).join(', ') || 'Location unavailable'}</span></div>
        <div><span>Last seen</span><strong>{time(visitor.lastSeen)} IST</strong></div>
        <span aria-hidden="true">{expanded === index ? '−' : '+'}</span>
      </button>
      <div className={styles.visitorMetrics}><span><b>{visitor.visits}</b> visits</span><span><b>{duration(visitor.activeSeconds)}</b> active</span><span><b>{visitor.events}</b> interactions</span><span>First seen {time(visitor.firstSeen)} IST</span></div>
      <div id={`visitor-details-${index}`} hidden={expanded !== index}>{expanded === index && (visitor._id ? <Visits ip={visitor._id} onExpired={onExpired}/> : <p>IP unavailable for this record.</p>)}</div>
    </article>)}
  </div>;
}
