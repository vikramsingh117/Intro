import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState } from 'react';
import { NOTEBOOK_PAGES } from './notebookPages';
import { SUBWAY_LIGHTING } from './subwayLighting';
import styles from '../../styles/Workbench.module.css';
const Scene = dynamic(() => import('./WorkbenchScene'), { ssr:false });
class Boundary extends Component {
  state = { failed:false };
  static getDerivedStateFromError() { return {failed:true}; }
  render() { return this.state.failed ? <div className={styles.fallback}>Your workspace is ready.<br /><button onClick={this.props.onEnter}>Open workspace</button></div> : this.props.children; }
}
const projects = [
  ['AI cooking experiences', 'Upliance · Product & AI integration', 'Helped shape when conversations offer recipe generation and how archived chats behave. Integrated the ADK chatbot backend and a backend-driven recipe-generation action.'],
  ['Discovery & preferences', 'Upliance · Product experience', 'Helped decide dietary and allergen behavior, built device-aware recipe discovery, and restored browsing context when users returned from recipes.'],
  ['AI operations', 'Upliance · Internal tools', 'Built chatbot-session inspection, recipe-generation timing interfaces, and document synchronization workflows over separate backend services.'],
];
export default function ProductWorkbench() {
  const [notebookOpen,setNotebookOpen] = useState(false);
  const [notebookLoaded,setNotebookLoaded] = useState(false);
  const [notebook,setNotebook] = useState(false);
  const [notebookPage,setNotebookPage] = useState(0);
  const [hoverLabel,setHoverLabel] = useState('');
  const notebookText = useRef(null), returnFocus = useRef(null);
  const [subwayReady,setSubwayReady] = useState(false);
  const windowBack = useRef(null);
  const desktopRef = useRef(null);
  const [outside,setOutside] = useState(false);
  const [lampOn,setLampOn] = useState(true);
  const [entered,setEntered] = useState(false);
  const [desktop,setDesktop] = useState(false);
  const [windowName,setWindowName] = useState(null);
  const [reduced,setReduced] = useState(true);
  const enterButton = useRef(null), exitButton = useRef(null), closeButton = useRef(null), workButton = useRef(null);
  useEffect(() => { const q=matchMedia('(prefers-reduced-motion: reduce)'); const update=()=>setReduced(q.matches); update(); q.addEventListener('change',update); return ()=>q.removeEventListener('change',update); },[]);
  useEffect(() => { if(desktop) exitButton.current?.focus(); },[desktop]);
  useEffect(() => { if(windowName) closeButton.current?.focus(); },[windowName]);
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
  const close = () => { setWindowName(null); requestAnimationFrame(()=>workButton.current?.focus()); };
  return <div className={styles.workbench} onKeyDown={event=>{if(notebook && (event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();setNotebookPage(value=>Math.max(0,Math.min(NOTEBOOK_PAGES.length-1,value+(event.key==='ArrowRight'?1:-1))));} else if(event.key==='Escape'&&notebook){event.preventDefault();leaveNotebook();} else if(event.key==='Escape'&&outside){event.preventDefault();setOutside(false);restoreFocus();} else if(event.key==='Escape'&&entered){event.preventDefault(); windowName ? close() : leave();}}}>
    <div className={styles.scene} style={{pointerEvents:entered ? 'none' : undefined}} aria-hidden={desktop} ref={enterButton} role="button" aria-label="Enter workspace by clicking the monitor" tabIndex={desktop || outside || notebook ? -1 : 0} onKeyDown={event=>{if(!outside && !notebook && (event.key==='Enter'||event.key===' ')){event.preventDefault();openMonitor();}}}>
      <div hidden={desktop || outside || notebook} className={styles.sceneLabel}>VIKRAM’S WORKSPACE <span>01 / ENTER TO EXPLORE</span></div>
      <Boundary onEnter={()=>{setEntered(true);setDesktop(true);}}><Scene notebookOpen={notebookOpen} onNotebookPageChange={setNotebookPage} onNotebookExit={leaveNotebook} notebook={notebook} notebookPage={notebookPage} onNotebookOpen={openNotebook} onHover={setHoverLabel} lighting={SUBWAY_LIGHTING} desktopRef={desktopRef} desktop={desktop} outside={outside} onSubwayReady={setSubwayReady} onWindowSelect={openWindow} lampOn={lampOn} onLampToggle={()=>setLampOn(value=>!value)} entered={entered} reduced={reduced} onEnter={openMonitor} onArrive={()=>setDesktop(true)} /></Boundary>
      <div hidden={desktop || notebook} className={styles.enterRow}><span>{outside ? (subwayReady ? "BERLIN AFTER DARK" : "Loading the subway…") : entered ? "Entering workspace…" : hoverLabel || "Drag to look around · Tap an object to explore"}</span></div>
    </div>
    {outside && <div className={styles.subwayToolbar}><span>OUTSIDE / BERLIN U-BAHN</span><button ref={windowBack} onClick={()=>{setOutside(false);restoreFocus();}}>← Back to desk</button></div>}
    {notebook && <>
      <article ref={notebookText} tabIndex={-1} className={styles.screenReaderOnly} aria-label="Notebook page text. Use arrow keys to turn pages and Escape to return.">
        <h2>{NOTEBOOK_PAGES[notebookPage].title}</h2>
        <p>{NOTEBOOK_PAGES[notebookPage].text}</p>
        <p>{NOTEBOOK_PAGES[notebookPage].question}</p>
        <ul>{NOTEBOOK_PAGES[notebookPage].notes.map(note=><li key={note}>{note}</li>)}</ul>
        <p>{NOTEBOOK_PAGES[notebookPage].caption}</p>
      </article>
    </>}
    <section ref={desktopRef} className={`${styles.desktop} ${styles.monitorDesktop}`}
      style={{pointerEvents:desktop ? 'auto' : 'none', opacity:outside || notebook ? 0 : 1}}
      inert={desktop ? undefined : ''} aria-hidden={!desktop} aria-label="Vikram’s monitor desktop">
      <div className={styles.desktopTop}><span>VIKRAM / BEYOND HOURS</span><button ref={exitButton} onClick={leave}>← Back to desk</button></div>
      <div className={styles.shortcuts}><button ref={workButton} onClick={()=>setWindowName('My Work')}><span>▰</span>My Work</button><button onClick={()=>setWindowName('About Me')}><span>◉</span>About Me</button></div>
      {windowName && <section className={styles.window} aria-label={windowName}>
        <header><span>▰ &nbsp; {windowName}</span><button ref={closeButton} onClick={close} aria-label={`Close ${windowName}`}>×</button></header>
        <div className={styles.windowContent}>{windowName==='My Work' ? <><p className={styles.eyebrow}>SELECTED CONTRIBUTIONS / UPLIANCE</p><h2>Decisions, then implementation.</h2>{projects.map(([title,tag,copy])=><article key={title}><small>{tag}</small><h3>{title}</h3><p>{copy}</p></article>)}</> : <><p className={styles.eyebrow}>ABOUT ME</p><h2>I shape and build AI products.</h2><p>I’m Vikram, an AI product engineer working across product decisions, user experience, AI integration, and production systems.</p><p>This workspace is an early prototype. Start with My Work to explore examples from Upliance.</p></>}</div>
      </section>}
      <footer className={styles.taskbar}><button onClick={()=>setWindowName('My Work')} aria-label="Open My Work">▦</button><span>Vikram’s workspace</span>{windowName&&<button onClick={()=>closeButton.current?.focus()}>{windowName}</button>}<span className={styles.taskbarRight}>PRODUCT · AI · ENGINEERING</span></footer>
    </section>
  </div>;
}
