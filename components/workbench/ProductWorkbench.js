import useTrackedState from './useTrackedState';
import { UPLIANCE_WORK } from './uplianceWork';
import Link from 'next/link';
import useFocusHistory from './useFocusHistory';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState } from 'react';
import useStickyNotes from './useStickyNotes';
import StickyNotesUI from './StickyNotesUI';
import GlassesOverlay from './GlassesOverlay';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';
import DesktopWorkspace from './DesktopWorkspace';
import PaperInventory from './PaperInventory';
import PaperFlick from './PaperFlick';
import RoomHoverLabel, { useRoomHoverStore } from './RoomHoverLabel';
import { NOTEBOOK_PAGES } from './notebookPages';
import { nextNotebookPage } from './notebookPaper.mjs';
import { DEFAULT_CITY_SETTINGS } from './citySettings';
import styles from '../../styles/Workbench.module.css';
const Scene = dynamic(() => import('./WorkbenchScene'), { ssr:false });
class Boundary extends Component {
  state = { failed:false };
  static getDerivedStateFromError() { return {failed:true}; }
  render() { return this.state.failed ? <div className={styles.fallback}>Your workspace is ready.<br /><button onClick={this.props.onEnter}>Open workspace</button></div> : this.props.children; }
}
const ROOM_OBJECTS = [
  {id:'monitor',label:'Monitor · explore my work'},
  {id:'photo',label:'Photo frame · take a closer look'},
  {id:'window',label:'Window · city after dark'},
  {id:'notebook',label:'Notebook · ideas & sketches'},
  {id:'upliance',label:'Upliance · explore my work'},
  {id:'desk-lamp',label:'Desk lamp · toggle light'},
  {id:'radio',label:'Radio · toggle music'},
  {id:'ceiling-light',label:'Ceiling light · toggle light'},
  {id:'drawer',label:'Top drawer · open or close'},
];
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
  const [tornPages,setTornPages] = useState([]);
  const [paperInventory,setPaperInventory] = useState([]);
  const heldPaper = paperInventory[0] || null;
  const [aimingPaper,setAimingPaper] = useState(false);
  const [paperInFlight,setPaperInFlight] = useState(false);
  const paperControls = useRef(null);
  const paperSequence = useRef(0);
  const tearPage = (page = notebookPage) => {
    if (!notebook || page !== notebookPage || tornPages.includes(page)) return;
    setTornPages(pages => [...pages, page]);
    const ball = { id: ++paperSequence.current, page };
    setPaperInventory(balls => [...balls, ball]);
    setNotebookPage(nextNotebookPage(page, 1, [...tornPages, page], NOTEBOOK_PAGES.length));
  };
  const onPaperThrown = useCallback(() => {
    setPaperInFlight(true);
    setAimingPaper(false);
    setPaperInventory(balls => balls.slice(1));
    requestAnimationFrame(() => enterButton.current?.focus({ preventScroll: true }));
  }, []);
  const hoverStore = useRoomHoverStore();
  const setHoverLabel = hoverStore.setLabel;
  const notebookText = useRef(null), returnFocus = useRef(null);
  const [cityReady,setCityReady] = useState(false);
  const windowBack = useRef(null);
  const desktopRef = useRef(null);
  const [upliance,setUpliance] = useState(null);
  const [upliancePage,setUpliancePage] = useState(0);
  const [uplianceArrived,setUplianceArrived] = useState(false);
  const uplianceBack=useRef(null);
  const uplianceReturnToMonitor=useRef(false);
  useEffect(()=>{if(uplianceArrived&&upliance)uplianceBack.current?.focus();},[uplianceArrived,upliance]);
  const [photo,setPhoto] = useState(false);
  const photoDismiss = useRef(null);
  useEffect(() => { if(photo) photoDismiss.current?.focus(); }, [photo]);
  const [outside,setOutside] = useState(false);
  const [lampOn,setLampOn] = useState(true);
  const [musicPlaying,setMusicPlaying] = useState(false);
  const handlePlaybackChange=useCallback((playing,allowMascot=false)=>{
    setMusicPlaying(playing&&allowMascot);
  },[]);
  const [entered,setEntered] = useState(false);
  const [desktop,setDesktop] = useState(false);
  const [keyboardObject,setKeyboardObject] = useState(-1);
  const roomActions = useRef(new Map());
  const registerRoomAction = useCallback((id,action)=>{
    roomActions.current.set(id,action);
    return ()=>{if(roomActions.current.get(id)===action)roomActions.current.delete(id);};
  },[]);
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
  const openNotebook = () => { if(photo || entered || outside || notebook || upliance) return; rememberFocus(); setNotebookOpen(true); setNotebook(true); };
  const openMonitor = () => { if(photo || entered || outside || notebook || upliance) return; rememberFocus(); setEntered(true); };
  const openWindow = () => { if(photo || entered || outside || notebook || upliance) return; rememberFocus(); setOutside(true); };
  const openPhoto = () => { if(photo || entered || outside || notebook || upliance || stickyNotes.editor || stickyNotes.placing) return; rememberFocus(); setPhoto(true); };
  const closePhoto = () => { setPhoto(false); restoreFocus(); };
  const leaveNotebook = () => { setNotebook(false); restoreFocus(); };
  useEffect(() => { if(notebook) notebookText.current?.focus(); }, [notebook]);
  const leave = () => { setDesktop(false); setEntered(false); restoreFocus(); };
  useTrackedState({photo,monitor:entered,window:outside,notebook,notebookPage:notebook?notebookPage:'closed',upliance:!!upliance,upliancePage:upliance?upliancePage:'closed',lamp:lampOn,glasses:wearingGlasses,noteEditor:!!stickyNotes.editor,notePlacement:!!stickyNotes.placing});
  const focused=!!(photo||entered||outside||notebook||upliance||stickyNotes.editor||stickyNotes.placing);
  const closeUpliance=()=>{
    const returnToMonitor=uplianceReturnToMonitor.current;
    uplianceReturnToMonitor.current=false;
    setUpliance(null);setUplianceArrived(false);
    if(returnToMonitor){setDesktop(false);setEntered(true);}
    restoreFocus();
  };
  const keyboardTarget=keyboardObject>=0?ROOM_OBJECTS[keyboardObject]:null;
  useEffect(()=>{if(!focused&&keyboardTarget)setHoverLabel(keyboardTarget.label);},[focused,keyboardTarget,setHoverLabel]);
  const keyboardLabel = useRef('');
  keyboardLabel.current = keyboardTarget?.label || '';
  const handleHover = useCallback(label => setHoverLabel(label || keyboardLabel.current), [setHoverLabel]);
  const releaseKeyboardSelection=event=>{
    if(event.pointerType!=='mouse'||keyboardObject<0)return;
    setKeyboardObject(-1);setHoverLabel('');
  };
  const activateRoomObject=()=>{
    const id=keyboardTarget?.id;
    if(!id){openMonitor();return;}
    if(id==='monitor')openMonitor();
    else if(id==='photo')openPhoto();
    else if(id==='window')openWindow();
    else if(id==='notebook')openNotebook();
    else roomActions.current.get(id)?.();
  };
  const openUplianceFromMonitor=()=>{
    uplianceReturnToMonitor.current=true;
    setDesktop(false);setEntered(false);setHoverLabel('');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      enterButton.current?.focus({preventScroll:true});
      roomActions.current.get('upliance')?.();
    }));
  };
  const handleWorkbenchKeyDown=event=>{
    if(aimingPaper){event.preventDefault();return;}
    if(photo && event.key==='Escape'){event.preventDefault();closePhoto();return;}
    if(upliance && event.key==='Escape'){event.preventDefault();closeUpliance();return;}
    if(stickyNotes.editor || stickyNotes.placing){if(event.key==='Escape'){event.preventDefault();stickyNotes.cancel();}return;}
    if(notebook && (event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();setNotebookPage(value=>nextNotebookPage(value, event.key==='ArrowRight'?1:-1, tornPages, NOTEBOOK_PAGES.length));return;}
    if(event.key==='Escape'&&notebook){event.preventDefault();leaveNotebook();return;}
    if(event.key==='Escape'&&outside){event.preventDefault();setOutside(false);restoreFocus();return;}
    if(event.key==='Escape'&&entered){event.preventDefault();leave();return;}
    if(focused || event.target!==enterButton.current)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();
      const direction=event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1;
      setKeyboardObject(current=>{
        const next=current<0?(direction>0?0:ROOM_OBJECTS.length-1):(current+direction+ROOM_OBJECTS.length)%ROOM_OBJECTS.length;
        setHoverLabel(ROOM_OBJECTS[next].label);
        return next;
      });
      return;
    }
    if(event.key==='Enter'||event.key===' '){event.preventDefault();activateRoomObject();return;}
    if(event.key==='Escape'&&keyboardObject>=0){event.preventDefault();setKeyboardObject(-1);setHoverLabel('');}
  };
  useFocusHistory(focused,()=>{
    uplianceReturnToMonitor.current=false;
    setPhoto(false);setDesktop(false);setEntered(false);setOutside(false);setNotebook(false);
    setUpliance(null);setUplianceArrived(false);stickyNotes.cancel(true);restoreFocus();
  });
  return <div ref={workbenchRef} className={styles.workbench} onKeyDown={handleWorkbenchKeyDown}>
    <div style={{display:'contents'}} inert={aimingPaper ? '' : undefined} aria-hidden={aimingPaper ? true : undefined}>
    <div className={styles.scene} onPointerMoveCapture={releaseKeyboardSelection} onPointerDownCapture={releaseKeyboardSelection} style={{pointerEvents:photo || entered || upliance ? 'none' : undefined}} aria-hidden={desktop} ref={enterButton} role="group" aria-label="Interactive room. Use arrow keys to select objects, Enter to activate, and Escape to return." tabIndex={photo || desktop || outside || notebook || !!upliance ? -1 : 0}>
      <div hidden={photo || desktop || outside || notebook || !!upliance} className={styles.sceneLabel}>VIKRAM’S WORKSPACE <span>01 / ENTER TO EXPLORE</span></div>
      <Boundary onEnter={()=>{setEntered(true);setDesktop(true);}}><Scene photo={photo} onPhotoOpen={openPhoto} musicPlaying={musicPlaying} onPlaybackChange={handlePlaybackChange} onNotebookTear={tearPage} onPaperMotionChange={setPaperInFlight} aimingPaper={aimingPaper} heldPaper={heldPaper} paperControls={paperControls} onPaperThrown={onPaperThrown} tornPages={tornPages} keyboardTarget={keyboardTarget?.id} registerRoomAction={registerRoomAction} upliance={upliance} upliancePage={upliancePage} uplianceArrived={uplianceArrived} uplianceControlsRef={uplianceBack} onUplianceArrive={()=>setUplianceArrived(true)} onUplianceSelect={view=>{if(photo||entered||outside||notebook||stickyNotes.editor||stickyNotes.placing)return;rememberFocus();setUplianceArrived(false);setUpliance(view);}} propPlacement={propPlacement} noteEditorRef={noteEditorRef} stickyNotes={stickyNotes} wearingGlasses={wearingGlasses} onWearGlasses={()=>setWearingGlasses(true)} citySettings={citySettings} notebookOpen={notebookOpen} onNotebookPageChange={setNotebookPage} onNotebookExit={leaveNotebook} notebook={notebook} notebookPage={notebookPage} onNotebookOpen={openNotebook} onHover={handleHover} desktopRef={desktopRef} desktop={desktop} outside={outside} onCityReady={setCityReady} onWindowSelect={openWindow} lampOn={lampOn} onLampToggle={()=>setLampOn(value=>!value)} entered={entered} reduced={reduced} onEnter={openMonitor} onArrive={()=>setDesktop(true)} /></Boundary>
      <div hidden={photo || desktop || notebook || !!upliance} className={styles.enterRow}><RoomHoverLabel store={hoverStore} outside={outside} cityReady={cityReady} entered={entered}/></div>
    </div>
    {upliance && <div ref={uplianceBack} tabIndex={-1} className={styles.uplianceControls} onClick={event=>{if(event.target===event.currentTarget)closeUpliance();}} style={{opacity:uplianceArrived?1:0}} inert={uplianceArrived?undefined:''} aria-hidden={!uplianceArrived} aria-label="Upliance work. Click either side of the screen or use arrow keys to change pages. Click outside or press Escape to return to the desk." onKeyDown={event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setUpliancePage(value=>Math.max(0,Math.min(UPLIANCE_WORK.length-1,value+(event.key==='ArrowRight'?1:-1))));}
    }}>
      <div data-display-surface="true" className={styles.uplianceSurface} onClick={event=>{
        event.stopPropagation();
        const surface=event.currentTarget;
        const midpoint=Number(surface.dataset.centerX);
        if(!Number.isFinite(midpoint))return;
        const direction=event.clientX-surface.getBoundingClientRect().left<midpoint?-1:1;
        setUpliancePage(value=>Math.max(0,Math.min(UPLIANCE_WORK.length-1,value+direction)));
      }}/>
      <article aria-live="polite" className={styles.screenReaderOnly}><h2>{UPLIANCE_WORK[upliancePage].title}</h2><p>{UPLIANCE_WORK[upliancePage].lines.join(' ')}</p></article>
    </div>}
    {photo && <button ref={photoDismiss} type="button" className={styles.photoDismiss} onClick={closePhoto} aria-label="Close photo and return to desk" />}
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
    {!focused && <Link href="/"><a className={styles.homeLink} aria-label="Back to home">← Home</a></Link>}
    <StickyNotesUI api={stickyNotes} elementRef={noteEditorRef}/>
    {wearingGlasses && <GlassesOverlay reduced={reduced} onRemove={removeGlasses}/>}
    <section ref={desktopRef} className={`${styles.desktop} ${styles.monitorDesktop}`}
      style={{pointerEvents:desktop ? 'auto' : 'none', opacity:photo || outside || notebook || upliance || (!desktop && (aimingPaper || paperInFlight)) ? 0 : 1}}
      inert={desktop ? undefined : ''} aria-hidden={!desktop} aria-label="Vikram’s monitor desktop">
      <DesktopWorkspace musicPlaying={musicPlaying} room={{lampOn,notebookOpen,notebookPage,wearingGlasses,cityReady,notesReady:stickyNotes.ready,noteCount:stickyNotes.notes.length}} desktopRef={desktopRef} interactive={desktop} visible={!photo&&!outside&&!notebook&&!upliance} reduced={reduced} exitRef={exitButton} onLeave={leave} onOpenUpliance={openUplianceFromMonitor}/>
    </section>
    {heldPaper && !focused && <PaperInventory count={paperInventory.length} onThrow={() => setAimingPaper(true)}/>}
    </div>
    {aimingPaper && <PaperFlick controls={paperControls} onCancel={() => { setAimingPaper(false); requestAnimationFrame(() => enterButton.current?.focus({preventScroll:true})); }}/>}
  </div>;
}
