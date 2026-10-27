import { useCallback, useEffect, useState } from 'react';
import styles from '../../styles/AdminView.module.css';
import AdminVisitors from './AdminVisitors';
const collections = ['visitor_activity', 'chatbot_requests', 'visitor_totals', 'wall_notes', 'photos'];
export default function AdminView({ onClose }) {
  const [collection, setCollection] = useState(collections[0]);
  const [page, setPage] = useState(0), [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const expire = useCallback(() => { setExpired(true); setData(null); setError('Session expired. Sign in again from Terminal.'); }, []);
  useEffect(() => {
    const timer = setTimeout(() => { setExpired(true); setData(null); setError('Session expired. Sign in again from Terminal.'); }, 15 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (expired) { setLoading(false); return; }
    const controller = new AbortController();
    setData(null); setError(''); setLoading(true);
    fetch(`/api/admin/data?collection=${collection}&page=${page}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) { if (response.status === 401) setExpired(true); throw Error(result.error); }
        if (!controller.signal.aborted) setData(result);
      }).catch(err => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [collection, page, refresh, expired]);
  const logout = async () => {
    setData(null); setLoading(true);
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' });
      if (!response.ok) throw Error('Could not sign out. Please retry.');
      onClose();
    } catch (err) { setError(err.message); setLoading(false); }
  };
  return <section className={styles.view} aria-label="MongoDB admin">
    <header><div><h2>MongoDB admin</h2><p>Read-only · IST fields alongside UTC dates · 15-minute session</p></div><button onClick={logout}>Sign out</button></header>
    <div className={styles.controls}><label>Collection <select disabled={expired} value={collection} onChange={event => { setCollection(event.target.value); setPage(0); }}>{collections.map(name => <option key={name} value={name}>{name.replace(/_/g, ' ')}</option>)}</select></label><button disabled={loading || expired} onClick={() => setRefresh(value => value + 1)}>Refresh</button></div>
    {loading && <p role="status">Loading records…</p>}
    {error && <p role="alert">{error}</p>}
    {expired && <button onClick={onClose}>Back to Terminal</button>}
    {data && <>{collection === 'visitor_activity' ? <AdminVisitors data={data} onExpired={expire}/> : <><p>Page {page + 1} · {data.records.length} records · sorted by document ID</p>{!data.records.length && <p>No records found.</p>}
      {data.records.map(record => <details key={String(record._id)}><summary>{record.prompt || record.text || record.landingPath || record.state || String(record._id)} <small>{record.createdAtIST || record.landedAtIST || record.firstSeenIST || record.createdAt || ''}</small></summary><pre>{JSON.stringify(record, null, 2)}</pre></details>)}
      </>}<nav aria-label="Record pages"><button disabled={page === 0 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page + 1}</span><button disabled={!data.hasNext || loading || page === 9999} onClick={() => setPage(value => value + 1)}>Next</button></nav></>}
  </section>;
}
