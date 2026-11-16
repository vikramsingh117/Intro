// Renders the authenticated read-only database console opened from the simulated terminal.
// It coordinates server-side collection search, validated sorting, pagination, refresh state, and visitor drill-downs.
import { useCallback, useEffect, useState } from 'react';
import styles from '../../styles/AdminView.module.css';
import AdminVisitors from './AdminVisitors';
const collections = {
  visitor_activity: { label: 'Visitor activity', defaultSort: 'lastSeen', sorts: { lastSeen: 'Last seen', firstSeen: 'First seen', visits: 'Visit count', active: 'Active time', interactions: 'Interactions' } },
  chatbot_requests: { label: 'Chatbot requests', defaultSort: 'newest', sorts: { newest: 'Document ID', created: 'Created time', duration: 'Duration' } },
  visitor_totals: { label: 'Visitor totals', defaultSort: 'lastSeen', sorts: { lastSeen: 'Last seen', firstSeen: 'First seen', landings: 'Landing count', active: 'Active time' } },
  wall_notes: { label: 'Wall notes', defaultSort: 'newest', sorts: { newest: 'Document ID', created: 'Created time', updated: 'Updated time' } },
  photos: { label: 'Photos', defaultSort: 'newest', sorts: { newest: 'Document ID', created: 'Created time' } },
};
const collectionNames = Object.keys(collections);
export default function AdminView({ onClose }) {
  const [collection, setCollection] = useState(collectionNames[0]);
  const [page, setPage] = useState(0), [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [queryInput, setQueryInput] = useState(''), [query, setQuery] = useState('');
  const [sort, setSort] = useState(collections[collectionNames[0]].defaultSort), [direction, setDirection] = useState('desc');
  const [updatedAt, setUpdatedAt] = useState(null);
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
    const params = new URLSearchParams({ collection, page: String(page), sort, direction });
    if (query) params.set('q', query);
    fetch(`/api/admin/data?${params}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) { if (response.status === 401) setExpired(true); throw Error(result.error); }
        if (!controller.signal.aborted) { setData(result); setUpdatedAt(new Date()); }
      }).catch(err => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [collection, page, refresh, expired, query, sort, direction]);
  const logout = async () => {
    setData(null); setLoading(true);
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' });
      if (!response.ok) throw Error('Could not sign out. Please retry.');
      onClose();
    } catch (err) { setError(err.message); setLoading(false); }
  };
  const changeCollection = event => {
    const next = event.target.value;
    setCollection(next); setPage(0); setQuery(''); setQueryInput(''); setSort(collections[next].defaultSort); setDirection('desc');
  };
  const applySearch = event => { event.preventDefault(); setPage(0); setQuery(queryInput.trim()); };
  const clearSearch = () => { setQueryInput(''); setQuery(''); setPage(0); };
  const sortOptions = collections[collection].sorts;
  return <section className={styles.view} aria-label="MongoDB admin">
    <header><div><h2>MongoDB admin</h2><p>Read-only · IST fields alongside UTC dates · 15-minute session</p></div><button onClick={logout}>Sign out</button></header>
    <div className={styles.controls}>
      <label>Collection <select disabled={expired} value={collection} onChange={changeCollection}>{collectionNames.map(name => <option key={name} value={name}>{collections[name].label}</option>)}</select></label>
      <label>Sort <select disabled={expired} value={sort} onChange={event => { setSort(event.target.value); setPage(0); }}>{Object.entries(sortOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Direction <select disabled={expired} value={direction} onChange={event => { setDirection(event.target.value); setPage(0); }}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
      <button disabled={loading || expired} onClick={() => setRefresh(value => value + 1)}>Refresh</button>
    </div>
    <form className={styles.search} role="search" onSubmit={applySearch}><label>Search this collection<input disabled={expired} maxLength={80} value={queryInput} onChange={event => setQueryInput(event.target.value)} placeholder="IP, location, text, action…"/></label><button disabled={loading || expired} type="submit">Search</button>{query && <button disabled={loading || expired} type="button" onClick={clearSearch}>Clear</button>}</form>
    {loading && <p role="status">Loading records…</p>}
    {error && <p role="alert">{error}</p>}
    {expired && <button onClick={onClose}>Back to Terminal</button>}
    {data && <><p className={styles.resultMeta}>Page {page + 1} · {data.records.length} shown · {query ? `search “${query}” · ` : ''}{sortOptions[sort]} {direction === 'desc' ? 'descending' : 'ascending'}{updatedAt ? ` · refreshed ${updatedAt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST` : ''}</p>{collection === 'visitor_activity' ? <AdminVisitors key={`${query}-${sort}-${direction}-${page}`} data={data} onExpired={expire}/> : <>{!data.records.length && <p>No records found.</p>}
      {data.records.map((record, index) => <details key={`${String(record._id)}-${index}`}><summary>{record.prompt || record.text || record.landingPath || record.state || String(record._id)} <small>{record.createdAtIST || record.landedAtIST || record.firstSeenIST || record.createdAt || ''}</small></summary><pre>{JSON.stringify(record, null, 2)}</pre></details>)}
      </>}<nav aria-label="Record pages"><button disabled={page === 0 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page + 1}</span><button disabled={!data.hasNext || loading || page === 9999} onClick={() => setPage(value => value + 1)}>Next</button></nav></>}
  </section>;
}
