import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState } from 'react';
import useStickyNotes from './useStickyNotes';
import StickyNotesUI from './StickyNotesUI';
import GlassesOverlay from './GlassesOverlay';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';
import DesktopWorkspace from './DesktopWorkspace';
import { NOTEBOOK_PAGES } from './notebookPages';
import { DEFAULT_CITY_SETTINGS } from './citySettings';
import styles from '../../styles/Workbench.module.css';
const Scene = dynamic(() => import('./WorkbenchScene'), { ssr:false });
class Boundary extends Component {
  state = { failed:false };
  static getDerivedStateFromError() { return {failed:true}; }
  render() { return this.state.failed ? <div className={styles.fallback}>Your workspace is ready.<br /><button onClick={this.props.onEnter}>Open workspace</button></div> : this.props.children; }
}
export default function ProductWorkbench() {
  const stickyNotes = useStickyNotes();
  const propPlacement=DEFAULT_PROP_PLACEMENT;
  const noteEditorRef = useRef(null);
  const workbenchRef = useRef(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const resize = () => {
      // Resize the camera and projected desktop above the phone's software keyboard.
      workbenchRef.current?.style.setProperty('--room-visible-height', `${viewport.height}px`);
    };
    resize();
    viewport.addEventListener('resize', resize);
    return () => viewport.removeEventListener('resize', resize);
  }, []);
  const [wearingGlasses, setWearingGlasses] = useState(false);
  const removeGlasses = () => { setWearingGlasses(false); requestAnimationFrame(() => enterButton.current?.focus({preventScroll:true})); };
  const citySettings = DEFAULT_CITY_SETTINGS;
  const [notebookOpen,setNotebookOpen] = useState(false);
  const [notebookLoaded,setNotebookLoaded] = useState(false);
  const [notebook,setNotebook] = useState(false);
  const [notebookPage,setNotebookPage] = useState(0);
  const [hoverLabel,setHoverLabel] = useState('');
  const notebookText = useRef(null), returnFocus = useRef(null);
  const [cityReady,setCityReady] = useState(false);
  const windowBack = useRef(null);
  const desktopRef = useRef(null);
  const [outside,setOutside] = useState(false);
  const [lampOn,setLampOn] = useState(true);
  const [entered,setEntered] = useState(false);
  const [desktop,setDesktop] = useState(false);
  const [reduced,setReduced] = useState(true);
  const enterButton = useRef(null), exitButton = useRef(null);
  useEffect(() => { const q=matchMedia('(prefers-reduced-motion: reduce)'); const update=()=>setReduced(q.matches); update(); q.addEventListener('change',update); return ()=>q.removeEventListener('change',update); },[]);
  useEffect(() => { if(desktop) exitButton.current?.focus(); },[desktop]);
  useEffect(() => { if(outside) windowBack.current?.focus(); },[outside]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cozy-notebook') || 'null');
      if(saved && Number.isInteger(saved.page) && saved.page>=0 && saved.page<NOTEBOOK_PAGES.length) {
        setNotebookPage(saved.page); setNotebookOpen(saved.open===true);
      }
    } catch {}
    setNotebookLoaded(true);
  }, []);
  useEffect(() => {
    if(!notebookLoaded) return;
    try { localStorage.setItem('cozy-notebook',JSON.stringify({open:notebookOpen,page:notebookPage})); } catch {}
  }, [notebookLoaded, notebookOpen, notebookPage]);
  const rememberFocus = () => { returnFocus.current = document.activeElement; setHoverLabel(''); };
  const restoreFocus = () => requestAnimationFrame(() => {
    const target = returnFocus.current;
    if (target?.isConnected && target !== document.body) target.focus(); else enterButton.current?.focus();
  });
  const openNotebook = () => { if(entered || outside || notebook) return; rememberFocus(); setNotebookOpen(true); setNotebook(true); };
  const openMonitor = () => { if(entered || outside || notebook) return; rememberFocus(); setEntered(true); };
  const openWindow = () => { if(entered || outside || notebook) return; rememberFocus(); setOutside(true); };
  const leaveNotebook = () => { setNotebook(false); restoreFocus(); };
  useEffect(() => { if(notebook) notebookText.current?.focus(); }, [notebook]);
  const leave = () => { setDesktop(false); setEntered(false); restoreFocus(); };
  return <div ref={workbenchRef} className={styles.workbench} onKeyDown={event=>{if(stickyNotes.editor || stickyNotes.placing){if(event.key==='Escape'){event.preventDefault();stickyNotes.cancel();}return;}if(notebook && (event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();setNotebookPage(value=>Math.max(0,Math.min(NOTEBOOK_PAGES.length-1,value+(event.key==='ArrowRight'?1:-1))));} else if(event.key==='Escape'&&notebook){event.preventDefault();leaveNotebook();} else if(event.key==='Escape'&&outside){event.preventDefault();setOutside(false);restoreFocus();} else if(event.key==='Escape'&&entered){event.preventDefault(); leave();}}}>
    <div className={styles.scene} style={{pointerEvents:entered ? 'none' : undefined}} aria-hidden={desktop} ref={enterButton} role="button" aria-label="Enter workspace by clicking the monitor" tabIndex={desktop || outside || notebook ? -1 : 0} onKeyDown={event=>{if(!outside && !notebook && (event.key==='Enter'||event.key===' ')){event.preventDefault();openMonitor();}}}>
      <div hidden={desktop || outside || notebook} className={styles.sceneLabel}>VIKRAM’S WORKSPACE <span>01 / ENTER TO EXPLORE</span></div>
      <Boundary onEnter={()=>{setEntered(true);setDesktop(true);}}><Scene propPlacement={propPlacement} noteEditorRef={noteEditorRef} stickyNotes={stickyNotes} wearingGlasses={wearingGlasses} onWearGlasses={()=>setWearingGlasses(true)} citySettings={citySettings} notebookOpen={notebookOpen} onNotebookPageChange={setNotebookPage} onNotebookExit={leaveNotebook} notebook={notebook} notebookPage={notebookPage} onNotebookOpen={openNotebook} onHover={setHoverLabel} desktopRef={desktopRef} desktop={desktop} outside={outside} onCityReady={setCityReady} onWindowSelect={openWindow} lampOn={lampOn} onLampToggle={()=>setLampOn(value=>!value)} entered={entered} reduced={reduced} onEnter={openMonitor} onArrive={()=>setDesktop(true)} /></Boundary>
      <div hidden={desktop || notebook} className={styles.enterRow}><span>{outside ? (cityReady ? "CITY AFTER DARK · Drag to look around" : "Loading the city…") : entered ? "Entering workspace…" : hoverLabel || "Drag to look around · Pinch to zoom · Tap to explore"}</span></div>
    </div>
    {outside && <div className={styles.subwayToolbar}><span>OUTSIDE / NIGHT CITY</span><button ref={windowBack} onClick={()=>{setOutside(false);restoreFocus();}}>← Back to desk</button></div>}
    {notebook && <>
      <button className={styles.mobileNotebookBack} onClick={leaveNotebook}>← Back to desk</button>
      <article ref={notebookText} tabIndex={-1} className={styles.screenReaderOnly} aria-label="Notebook page text. Use arrow keys to turn pages and Escape to return.">
        <h2>{NOTEBOOK_PAGES[notebookPage].title}</h2>
        <p>{NOTEBOOK_PAGES[notebookPage].text}</p>
        <p>{NOTEBOOK_PAGES[notebookPage].question}</p>
        <ul>{NOTEBOOK_PAGES[notebookPage].notes.map(note=><li key={note}>{note}</li>)}</ul>
        <p>{NOTEBOOK_PAGES[notebookPage].caption}</p>
      </article>
    </>}
    <StickyNotesUI api={stickyNotes} elementRef={noteEditorRef}/>
    {wearingGlasses && <GlassesOverlay reduced={reduced} onRemove={removeGlasses}/>}
    <section ref={desktopRef} className={`${styles.desktop} ${styles.monitorDesktop}`}
      style={{pointerEvents:desktop ? 'auto' : 'none', opacity:outside || notebook ? 0 : 1}}
      inert={desktop ? undefined : ''} aria-hidden={!desktop} aria-label="Vikram’s monitor desktop">
      <DesktopWorkspace room={{lampOn,notebookOpen,notebookPage,wearingGlasses,cityReady,notesReady:stickyNotes.ready,noteCount:stickyNotes.notes.length}} desktopRef={desktopRef} interactive={desktop} exitRef={exitButton} onLeave={leave}/>
    </section>
  </div>;
}
