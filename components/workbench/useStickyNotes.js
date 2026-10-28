import { useCallback, useEffect, useRef, useState } from 'react';

export default function useStickyNotes() {
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState([]);
  const [ready, setReady] = useState(false);
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState('');
  const [placing, setPlacing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const owner = useRef(null), working = useRef(false), requestVersion = useRef(0), mounted = useRef(false);
  const interacting = useRef(false);
  interacting.current = dragging || !!editor || !!placing;
  const apiRequest = useCallback(async (method='GET', body) => {
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(),15000);
    try {
      const response = await fetch('/api/wall-notes', {method,signal:controller.signal,headers:{'Content-Type':'application/json',...(owner.current?{'x-note-owner':owner.current}:{})},...(body?{body:JSON.stringify(body)}:{})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save the note.');
      return data;
    } finally { clearTimeout(timer); }
  }, []);
  const refresh = useCallback(async () => {
    if(working.current || interacting.current || document.hidden)return;
    const version=++requestVersion.current;
    try {
      const data=await apiRequest();
      if(mounted.current && version===requestVersion.current){setNotes(data.notes);setReady(true);setError('');}
    } catch {
      // Background loading failures stay silent; polling retries and existing notes remain visible.
    }
  }, [apiRequest]);
  useEffect(() => {
    mounted.current=true;
    const versionRef=requestVersion;
    try {
      owner.current=localStorage.getItem('cozy-note-owner');
      if(!/^[0-9a-f-]{36}$/i.test(owner.current || '')){owner.current=crypto.randomUUID();localStorage.setItem('cozy-note-owner',owner.current);}
    } catch { owner.current=crypto.randomUUID(); }
    refresh();
    const timer=setInterval(refresh,15000);
    const visible=()=>{if(!document.hidden)refresh();};
    document.addEventListener('visibilitychange',visible);
    return ()=>{mounted.current=false;versionRef.current++;clearInterval(timer);document.removeEventListener('visibilitychange',visible);};
  }, [refresh]);
  const mutate = async (method,body,success) => {
    if(working.current)return;
    working.current=true;requestVersion.current++;setBusy(true);setError('');
    try {
      const data=await apiRequest(method,body);
      if(mounted.current){
        setNotes(current=>method==='DELETE'?current.filter(note=>note.id!==body.id):[data.note,...current.filter(note=>note.id!==data.note.id)].slice(0,200));
        success?.();
      }
    } catch(err) {if(mounted.current)setError(err.name==='AbortError'?'The request timed out. Please try again.':err.message);}
    finally {working.current=false;if(mounted.current)setBusy(false);}
  };
  const cancel = force => { if(!busy || force===true){setEditor(null);setPlacing(null);setError('');} };
  const edit = note => {if(busy)return;setEditor(note || {id:null,canEdit:true});setDraft(note?.text || '');setPlacing(null);setError('');};
  const save = event => {
    event.preventDefault();const text=draft.trim();if(!text || !editor?.canEdit || busy)return;
    if(editor.id)mutate('PATCH',{...editor,text},()=>setEditor(null));
    else {setPlacing({id:crypto.randomUUID(),text});setEditor(null);}
  };
  const place = (x,y) => {if(placing && !busy)mutate('POST',{...placing,x,y},()=>setPlacing(null));};
  const move = (id,x,y) => {const note=notes.find(n=>n.id===id);if(note?.canEdit)mutate('PATCH',{...note,x,y});};
  const remove = () => {if(editor?.canEdit)mutate('DELETE',{id:editor.id},()=>setEditor(null));};
  return {dragging,setDragging,notes,ready,editor,draft,setDraft,placing,cancel,edit,save,place,move,remove,busy,error,refresh};
}
