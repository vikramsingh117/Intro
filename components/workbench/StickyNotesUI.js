import noteDate from './noteDate';
import styles from '../../styles/Workbench.module.css';
export default function StickyNotesUI({ api, elementRef }) {
  if(api.editor)return <div ref={elementRef} className={styles.noteSheet} onKeyDown={event=>{event.stopPropagation();if(event.key==='Escape')api.cancel();}}>
    <form className={styles.noteEditor} onSubmit={api.save} aria-label="Wall note">
      <header><strong>{api.editor.id?'':'Leave a little note'}</strong><button disabled={api.busy} type="button" onClick={api.cancel} aria-label="Close note">×</button></header>
      <label htmlFor="wall-note-text">Message</label>
      <textarea id="wall-note-text" maxLength={240} readOnly={!api.editor.canEdit} disabled={api.busy} value={api.draft} onChange={event=>api.setDraft(event.target.value)} placeholder="A thought, a hello, something worth sticking around…"/>
      {noteDate(api.editor.createdAt) && <small><time dateTime={api.editor.createdAt}>{noteDate(api.editor.createdAt)}</time></small>}
      {api.error && <p role="alert">{api.error}</p>}
      <footer>{api.editor.id && api.editor.canEdit && <button disabled={api.busy} type="button" onClick={api.remove}>Remove</button>}{api.editor.canEdit && <button type="submit" disabled={api.busy || !api.draft.trim()}>{api.busy?'Saving…':api.editor.id?'Save note':'Peel & stick'}</button>}</footer>
    </form>
  </div>;
  if(api.placing)return <div className={styles.notePlacement} role="status">{api.error || (api.busy?'Sticking your note…':'Tap the highlighted wall to share your note')} <button disabled={api.busy} onClick={api.cancel}>Cancel</button></div>;
  if(api.error)return <div className={styles.notePlacement} role="alert">{api.error}<button onClick={api.refresh}>Retry</button><button onClick={api.cancel}>Dismiss</button></div>;
  return null;
}
