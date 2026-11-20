// Owns the After Hours experience state and coordinates its HTML overlays with the 3D scene.
// It connects WorkbenchScene, DesktopWorkspace, focused objects, room actions, persistence, and the desktop zoom overlay.
import useTrackedState from './useTrackedState';
import { UPLIANCE_WORK } from './uplianceWork';
import Link from 'next/link';
import useFocusHistory from './useFocusHistory';
import dynamic from 'next/dynamic';
import { preloadAboutJourney } from './loadAboutJourney';
import { Component, useCallback, useEffect, useRef, useState } from 'react';
import useStickyNotes from './useStickyNotes';
import StickyNotesUI from './StickyNotesUI';
import GlassesOverlay from './GlassesOverlay';
import { DEFAULT_LENS_SETTINGS } from './lensSettings';
import { DEFAULT_PROP_PLACEMENT } from './propPlacement';
import DesktopWorkspace from './DesktopWorkspace';
import { CELEBRATION_MS } from './basketball.mjs';
import { initialPaperInventory, consumePaper, refillPage, STARTING_PAPER_COUNT } from './paperInventoryState.mjs';
import PaperFlick from './PaperFlick';
import RoomHoverLabel, { useRoomHoverStore } from './RoomHoverLabel';
import DesktopZoomControl from './DesktopZoomControl';
import { NOTEBOOK_PAGES, notebookPagesForYear } from './notebookPages';
import { nextNotebookPage } from './notebookPaper.mjs';
import { CITY_SETTINGS_BY_YEAR, DEFAULT_CITY_SETTINGS } from './citySettings';
import { DEFAULT_ROOM_YEAR, roomYearFor } from './roomYears.mjs';
import styles from '../../styles/Workbench.module.css';
import transitionStyles from '../../styles/RoomYearTransition.module.css';
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
  {id:'paper-pile',label:'Paper balls · pick up to throw'},
  {id:'upliance',label:'Upliance · explore my work'},
  {id:'desk-lamp',label:'Desk lamp · toggle light'},
  {id:'radio',label:'Radio · toggle music'},
  {id:'work-board',label:'Work / Build projector · inspect'},
  {id:'ceiling-light',label:'Ceiling light · toggle light'},
  {id:'drawer',label:'Top drawer · open or close'},
  {id:'glasses-blur',label:'Round glasses · wear blur lens'},
  {id:'glasses-pixel',label:'Pixel glasses · wear pixel lens'},
  {id:'glasses-crayon',label:'Pastel glasses · wear crayon lens'},
  {id:'glasses-sketch',label:'Monochrome glasses · wear sketch lens'},
  {id:'letter-clock',label:'Letter clock - toggle 12/24 hour time'},
];
const WINDOW_LABELS={
  '2021':'Window · daylight',
  '2025':'Window · rainy city',
  '2026':'Window · city after dark',
};
export default function ProductWorkbench() {
  const [roomYear,setRoomYear]=useState(DEFAULT_ROOM_YEAR);
  const [projectorState,setProjectorState]=useState({powered:true,pull:{x:0,y:0}});
  const [clock24Hour,setClock24Hour]=useState(false);
  const [roomYearTransition,setRoomYearTransition]=useState('idle');
  const [roomYearTarget,setRoomYearTarget]=useState(DEFAULT_ROOM_YEAR);
  const roomYearTimers=useRef([]);
  const [optimised,setOptimised]=useState(false);
  const [sceneRestarting,setSceneRestarting]=useState(false);
  const [sceneRestartKey,setSceneRestartKey]=useState(0);
  const optimiseTimer=useRef(null);
  useEffect(()=>()=>window.clearTimeout(optimiseTimer.current),[]);
  useEffect(()=>()=>roomYearTimers.current.forEach(timer=>window.clearTimeout(timer)),[]);
  const toggleOptimisation=useCallback(()=>{
    if(sceneRestarting)return;
    // Cover the whole workbench while the renderer and physics settings change together.
    setSceneRestarting(true);
    optimiseTimer.current=window.setTimeout(()=>{
      setOptimised(value=>!value);
      setSceneRestartKey(value=>value+1);
      requestAnimationFrame(()=>{optimiseTimer.current=window.setTimeout(()=>setSceneRestarting(false),360);});
    },220);
  },[sceneRestarting]);
  useEffect(()=>{
    const enableForSlowStart=()=>{if(!optimised&&!sceneRestarting)toggleOptimisation();};
    window.addEventListener('workbench:slow-start',enableForSlowStart);
    return ()=>window.removeEventListener('workbench:slow-start',enableForSlowStart);
  },[optimised,sceneRestarting,toggleOptimisation]);
  const stickyNotes = useStickyNotes();
  const propPlacement=DEFAULT_PROP_PLACEMENT;
  const lensSettings=DEFAULT_LENS_SETTINGS;
  const glassesPlacement=DEFAULT_PROP_PLACEMENT.glasses;
  const stickyNotePlacement=DEFAULT_PROP_PLACEMENT.stickyNote;
  const noteEditorRef = useRef(null);
  const workbenchRef = useRef(null);
  useEffect(() => {
    const element = workbenchRef.current;
    if (!element) return;
    // Trackpad pinch is exposed by Chromium as a cancelable Ctrl+wheel event;
    // Safari uses gesture events. Keep either from scaling the whole webpage
    // while the visitor is interacting with the room.
    const insideWorkbench = event => event.target instanceof Node && element.contains(event.target);
    const preventBrowserZoom = event => {
      if (insideWorkbench(event) && (event.type.startsWith('gesture') || event.ctrlKey || event.metaKey)) event.preventDefault();
    };
    window.addEventListener('wheel',preventBrowserZoom,{capture:true,passive:false});
    window.addEventListener('gesturestart',preventBrowserZoom,{capture:true,passive:false});
    window.addEventListener('gesturechange',preventBrowserZoom,{capture:true,passive:false});
    return () => {
      window.removeEventListener('wheel',preventBrowserZoom,{capture:true});
      window.removeEventListener('gesturestart',preventBrowserZoom,{capture:true});
      window.removeEventListener('gesturechange',preventBrowserZoom,{capture:true});
    };
  }, []);
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
  const [glassesLens, setGlassesLens] = useState('blur');
  const [glassesLeaving,setGlassesLeaving]=useState(false);
  const wearGlasses = lens => { setGlassesLens(lens); setGlassesLeaving(false); setWearingGlasses(true); };
  const removeGlasses = () => { setWearingGlasses(false); setGlassesLeaving(false); requestAnimationFrame(() => enterButton.current?.focus({preventScroll:true})); };
  const citySettings=CITY_SETTINGS_BY_YEAR[roomYear]||DEFAULT_CITY_SETTINGS;
  const notebookPages=notebookPagesForYear(roomYear);
  const [notebookOpen,setNotebookOpen] = useState(false);
  const [notebookLoaded,setNotebookLoaded] = useState(false);
  const [notebook,setNotebook] = useState(false);
  const [notebookPage,setNotebookPage] = useState(0);
  const [tornPages,setTornPages] = useState([]);
  const [paperInventory,setPaperInventory] = useState(initialPaperInventory);
  const heldPaper = paperInventory[0] || null;
  const [aimingPaper,setAimingPaper] = useState(false);
  const [paperInFlight,setPaperInFlight] = useState(false);
  const [basketScore,setBasketScore] = useState(0);
  const [celebrating,setCelebrating] = useState(false);
  const onBasket = useCallback(() => { setBasketScore(value=>value+1); setCelebrating(true); }, []);
  useEffect(() => {
    if (!basketScore) return;
    const timer = setTimeout(()=>setCelebrating(false), CELEBRATION_MS);
    return () => clearTimeout(timer);
  }, [basketScore]);
  const [lastFlickAt,setLastFlickAt] = useState(null);
  const tearHintShown = useRef(false);
  useEffect(() => {
    try { tearHintShown.current = localStorage.getItem('notebook-tear-hint-shown') === 'true'; } catch {}
  }, []);
  const paperControls = useRef(null);
  const paperSequence = useRef(STARTING_PAPER_COUNT);
  const tearPage = (page = notebookPage) => {
    if (!notebook || page !== notebookPage || tornPages.includes(page)) return;
    setTornPages(pages => [...pages, page]);
    const ball = { id: ++paperSequence.current, page };
    setPaperInventory(balls => [...balls, ball]);
    setNotebookPage(nextNotebookPage(page,1,[...tornPages,page],notebookPages.length));
  };
  const pickUpPaper = useCallback(() => setAimingPaper(true), []);
  const onPaperThrown = useCallback(id => {
    setPaperInFlight(true);
    setLastFlickAt(performance.now());
    setPaperInventory(balls => consumePaper(balls, id));
  }, []);
  useEffect(() => {
    if (aimingPaper && !paperInventory.length) setAimingPaper(false);
  }, [aimingPaper, paperInventory.length]);
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
  const notebookReturnToMonitor=useRef(false);
  const notesReturnToMonitor=useRef(false);
  const windowReturnToMonitor=useRef(false);
  const monitorReturnFocus=useRef(null);
  useEffect(()=>{if(uplianceArrived&&upliance)uplianceBack.current?.focus();},[uplianceArrived,upliance]);
  const [photo,setPhoto] = useState(false);
  const photoDismiss = useRef(null);
  useEffect(() => { if(photo) photoDismiss.current?.focus(); }, [photo]);
  const [workBoard,setWorkBoard]=useState(false);
  const [workBoardTile,setWorkBoardTile]=useState(null);
  const [workBoardDetail,setWorkBoardDetail]=useState(null);
  const workBoardReturnToMonitor=useRef(false);
  const workBoardDismiss=useRef(null);
  useEffect(()=>{if(workBoard)workBoardDismiss.current?.focus();},[workBoard]);
  const [outside,setOutside] = useState(false);
  const [lampOn,setLampOn] = useState(true);
  const [ceilingOn,setCeilingOn] = useState(true);
  const [radioPlaying,setRadioPlaying] = useState(false);
  const [musicPlaying,setMusicPlaying] = useState(false);
  const handlePlaybackChange=useCallback((playing,allowMascot=false)=>{
    setRadioPlaying(playing);
    setMusicPlaying(playing&&allowMascot);
  },[]);
  const [entered,setEntered] = useState(false);
  const [desktop,setDesktop] = useState(false);
  const [roomResetKey,setRoomResetKey] = useState(0);
  const [keyboardObject,setKeyboardObject] = useState(-1);
  const roomActions = useRef(new Map());
  const registerRoomAction = useCallback((id,action)=>{
    roomActions.current.set(id,action);
    return ()=>{if(roomActions.current.get(id)===action)roomActions.current.delete(id);};
  },[]);
  const activeRoomObjects=roomYearFor(roomYear).objects;
  const [reduced,setReduced] = useState(true);
  const enterButton = useRef(null), exitButton = useRef(null);
  useEffect(() => { const q=matchMedia('(prefers-reduced-motion: reduce)'); const update=()=>setReduced(q.matches); update(); q.addEventListener('change',update); return ()=>q.removeEventListener('change',update); },[]);
  useEffect(() => {
    if (!desktop) return;
    const target = monitorReturnFocus.current;
    monitorReturnFocus.current = null;
    if (target?.isConnected) target.focus({preventScroll:true});
    else exitButton.current?.focus();
  },[desktop]);
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
  const openNotebook = () => { if(photo || workBoard || entered || outside || notebook || upliance) return; rememberFocus(); setNotebookOpen(true); setNotebook(true); };
  const openMonitor = () => { if(photo || workBoard || entered || outside || notebook || upliance) return; rememberFocus(); setWearingGlasses(false); setEntered(true); };
  const openWindow = () => { if(photo || workBoard || entered || outside || notebook || upliance) return; rememberFocus(); setOutside(true); };
  const openPhoto = () => { if(photo || workBoard || entered || outside || notebook || upliance || stickyNotes.editor || stickyNotes.placing) return; rememberFocus(); setPhoto(true); };
  const closePhoto = () => { setPhoto(false); restoreFocus(); };
  const openWorkBoard=()=>{if(photo||workBoard||entered||outside||notebook||upliance||aimingPaper)return;rememberFocus();setWorkBoardTile(null);setWorkBoard(true);};
  const closeWorkBoard=()=>{
    const returnToMonitor=workBoardReturnToMonitor.current;
    workBoardReturnToMonitor.current=false;setWorkBoard(false);setWorkBoardTile(null);
    if(returnToMonitor){setDesktop(false);setEntered(true);}
    else restoreFocus();
  };
  const leaveNotebook = () => {
    const returnToMonitor = notebookReturnToMonitor.current;
    notebookReturnToMonitor.current = false;
    setNotebook(false);
    if (returnToMonitor) { setDesktop(false); setEntered(true); }
    else restoreFocus();
  };
  useEffect(() => { if(notebook) notebookText.current?.focus(); }, [notebook]);
  const leave = () => { setDesktop(false); setEntered(false); setRoomResetKey(value=>value+1); restoreFocus(); };
  useTrackedState({roomYear,photo,workBoard,monitor:entered,window:outside,notebook,notebookPage:notebook?notebookPage:'closed',upliance:!!upliance,upliancePage:upliance?upliancePage:'closed',lamp:lampOn,glasses:wearingGlasses,noteEditor:!!stickyNotes.editor,notePlacement:!!stickyNotes.placing});
  const focused=!!(photo||workBoard||entered||outside||notebook||upliance||stickyNotes.editor||stickyNotes.placing);
  useEffect(() => {
    if (paperInventory.length || lastFlickAt === null || tearHintShown.current) return;
    // Respect a visitor opening another object while the final ball is in flight.
    if (focused) { setLastFlickAt(null); return; }
    const timer = setTimeout(() => {
      setLastFlickAt(null);
      const instructionPage=notebookPages.findIndex(page=>page.doodle==='tear');
      const page=refillPage(notebookPages.length,instructionPage,tornPages);
      if (page !== null) {
        tearHintShown.current = true;
        try { localStorage.setItem('notebook-tear-hint-shown', 'true'); } catch {}
        returnFocus.current = enterButton.current;
        setNotebookPage(page); setNotebookOpen(true); setNotebook(true);
      } else enterButton.current?.focus({ preventScroll: true });
    }, Math.max(0, 3000 - (performance.now() - lastFlickAt)));
    return () => clearTimeout(timer);
  }, [paperInventory.length,lastFlickAt,focused,tornPages,notebookPages]);
  const closeUpliance=()=>{
    const returnToMonitor=uplianceReturnToMonitor.current;
    uplianceReturnToMonitor.current=false;
    setUpliance(null);setUplianceArrived(false);
    if(returnToMonitor){setDesktop(false);setEntered(true);}
    restoreFocus();
  };
  const availableRoomObjects=ROOM_OBJECTS.filter(object=>activeRoomObjects.includes(object.id)).map(object=>object.id==='window'?{...object,label:WINDOW_LABELS[roomYear]}:object);
  const keyboardTarget=keyboardObject>=0?availableRoomObjects[keyboardObject]:null;
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
    monitorReturnFocus.current=document.activeElement;
    uplianceReturnToMonitor.current=true;
    setDesktop(false);setEntered(false);setHoverLabel('');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      enterButton.current?.focus({preventScroll:true});
      roomActions.current.get('upliance')?.();
    }));
  };
  const openNotebookFromMonitor=()=>{
    monitorReturnFocus.current=document.activeElement;
    notebookReturnToMonitor.current=true;
    setDesktop(false);setEntered(false);setHoverLabel('');
    setNotebookOpen(true);setNotebook(true);
  };
  const openNotesFromMonitor=note=>{
    if(!note)return;
    monitorReturnFocus.current=document.activeElement;
    notesReturnToMonitor.current=true;
    setDesktop(false);setEntered(false);setHoverLabel('');
    stickyNotes.edit(note);
    requestAnimationFrame(()=>requestAnimationFrame(()=>noteEditorRef.current?.querySelector('textarea')?.focus({preventScroll:true})));
  };
  const openWindowFromMonitor=()=>{
    monitorReturnFocus.current=document.activeElement;
    windowReturnToMonitor.current=true;
    setDesktop(false);setEntered(false);setHoverLabel('');setOutside(true);
  };
  const openWorkBoardFromMonitor=id=>{
    monitorReturnFocus.current=document.activeElement;
    workBoardReturnToMonitor.current=true;
    setWorkBoardTile(id);setDesktop(false);setEntered(false);setHoverLabel('');setWorkBoard(true);
  };
  const selectWorkBoardTile=id=>{
    setWorkBoardTile(id);
    if(!workBoardReturnToMonitor.current)return;
    workBoardReturnToMonitor.current=false;
    setWorkBoardDetail({id,at:Date.now()});setWorkBoard(false);setDesktop(false);setEntered(true);
  };
  const leaveWindow=()=>{
    const returnToMonitor=windowReturnToMonitor.current;
    windowReturnToMonitor.current=false;
    workBoardReturnToMonitor.current=false;
    setOutside(false);
    if(returnToMonitor){setDesktop(false);setEntered(true);}
    else restoreFocus();
  };
  const zoomOutOfFocus=()=>{
    if(photo)closePhoto();
    else if(workBoard)closeWorkBoard();
    else if(upliance)closeUpliance();
    else if(stickyNotes.editor||stickyNotes.placing)stickyNotes.cancel();
    else if(notebook)leaveNotebook();
    else if(outside)leaveWindow();
    else if(entered)leave();
  };
  const zoomOutOfFocusRef=useRef(zoomOutOfFocus);
  zoomOutOfFocusRef.current=zoomOutOfFocus;
  useEffect(()=>{
    if(!focused)return;
    const element=workbenchRef.current;
    if(!element)return;
    let exited=false,pinchStart=null,gestureStartScale=1;
    const inside=event=>(event.target instanceof Node&&element.contains(event.target))||element.matches(':hover');
    const exit=()=>{
      if(exited)return;
      exited=true;
      zoomOutOfFocusRef.current();
    };
    const wheel=event=>{
      if(!inside(event))return;
      if(event.ctrlKey||event.metaKey)event.preventDefault();
      const delta=event.deltaMode===1?event.deltaY*16:event.deltaY;
      if(delta>0)exit();
    };
    const distance=touches=>Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY);
    const touchStart=event=>{if(inside(event)&&event.touches.length===2)pinchStart=distance(event.touches);};
    const touchMove=event=>{if(pinchStart!==null&&event.touches.length===2&&distance(event.touches)<pinchStart-12)exit();};
    const touchEnd=()=>{pinchStart=null;};
    const gestureStart=event=>{if(inside(event)){event.preventDefault();gestureStartScale=Number.isFinite(event.scale)?event.scale:1;}};
    const gestureChange=event=>{if(!inside(event))return;event.preventDefault();if(Number.isFinite(event.scale)&&event.scale<gestureStartScale*.98)exit();};
    window.addEventListener('wheel',wheel,{capture:true,passive:false});
    window.addEventListener('touchstart',touchStart,{capture:true,passive:true});
    window.addEventListener('touchmove',touchMove,{capture:true,passive:true});
    window.addEventListener('touchend',touchEnd,{capture:true,passive:true});
    window.addEventListener('touchcancel',touchEnd,{capture:true,passive:true});
    window.addEventListener('gesturestart',gestureStart,{capture:true,passive:false});
    window.addEventListener('gesturechange',gestureChange,{capture:true,passive:false});
    return()=>{
      window.removeEventListener('wheel',wheel,{capture:true});
      window.removeEventListener('touchstart',touchStart,{capture:true});
      window.removeEventListener('touchmove',touchMove,{capture:true});
      window.removeEventListener('touchend',touchEnd,{capture:true});
      window.removeEventListener('touchcancel',touchEnd,{capture:true});
      window.removeEventListener('gesturestart',gestureStart,{capture:true});
      window.removeEventListener('gesturechange',gestureChange,{capture:true});
    };
  },[focused]);
  useEffect(()=>{
    if(!notesReturnToMonitor.current || stickyNotes.editor || stickyNotes.placing)return;
    notesReturnToMonitor.current=false;
    setDesktop(false);setEntered(true);
  },[stickyNotes.editor,stickyNotes.placing]);
  const toggleRadioFromMonitor=()=>{roomActions.current.get('radio')?.();};
  const requestRoomYear=year=>{
    const chapter=roomYearFor(year);
    if(chapter.year===roomYear&&roomYearTransition==='idle')return;
    roomYearTimers.current.forEach(timer=>window.clearTimeout(timer));
    roomYearTimers.current=[];
    setRoomYearTarget(chapter.year);
    const swapRoom=()=>{
      setAimingPaper(false);setPaperInFlight(false);setCelebrating(false);setKeyboardObject(-1);setHoverLabel('');
      setWearingGlasses(false);setGlassesLeaving(false);setPhoto(false);setWorkBoard(false);setOutside(false);setNotebook(false);setUpliance(null);setUplianceArrived(false);
      stickyNotes.cancel(true);
      setRoomYear(chapter.year);
    };
    if(reduced){swapRoom();setRoomYearTransition('idle');return;}
    setRoomYearTransition('darkening');
    roomYearTimers.current.push(window.setTimeout(()=>{
      swapRoom();
      setRoomYearTransition('holding');
      roomYearTimers.current.push(window.setTimeout(()=>setRoomYearTransition('revealing'),120));
      roomYearTimers.current.push(window.setTimeout(()=>setRoomYearTransition('idle'),720));
    },340));
  };
  const handleWorkbenchKeyDown=event=>{
    if(aimingPaper){event.preventDefault();return;}
    if(photo && event.key==='Escape'){event.preventDefault();closePhoto();return;}
    if(workBoard && event.key==='Escape'){event.preventDefault();closeWorkBoard();return;}
    if(upliance && event.key==='Escape'){event.preventDefault();closeUpliance();return;}
    if(stickyNotes.editor || stickyNotes.placing){if(event.key==='Escape'){event.preventDefault();stickyNotes.cancel();}return;}
    if(notebook && (event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();setNotebookPage(value=>nextNotebookPage(value,event.key==='ArrowRight'?1:-1,tornPages,notebookPages.length));return;}
    if(event.key==='Escape'&&notebook){event.preventDefault();leaveNotebook();return;}
    if(event.key==='Escape'&&outside){event.preventDefault();leaveWindow();return;}
    if(event.key==='Escape'&&entered){event.preventDefault();leave();return;}
    if(focused || event.target!==enterButton.current)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();
      const direction=event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1;
      setKeyboardObject(current=>{
        const next=current<0?(direction>0?0:availableRoomObjects.length-1):(current+direction+availableRoomObjects.length)%availableRoomObjects.length;
        setHoverLabel(availableRoomObjects[next].label);
        return next;
      });
      return;
    }
    if(event.key==='Enter'||event.key===' '){event.preventDefault();activateRoomObject();return;}
    if(event.key==='Escape'&&keyboardObject>=0){event.preventDefault();setKeyboardObject(-1);setHoverLabel('');}
  };
  useFocusHistory(focused,()=>{
    uplianceReturnToMonitor.current=false;
    notebookReturnToMonitor.current=false;
    notesReturnToMonitor.current=false;
    windowReturnToMonitor.current=false;
    monitorReturnFocus.current=null;
    setPhoto(false);setWorkBoard(false);setDesktop(false);setEntered(false);setOutside(false);setNotebook(false);
    setUpliance(null);setUplianceArrived(false);stickyNotes.cancel(true);restoreFocus();
  });
  return <div ref={workbenchRef} className={styles.workbench} onKeyDown={handleWorkbenchKeyDown}>
    {!aimingPaper&&roomYearTransition==='idle'&&<button id="optimise-button" type="button" className={styles.optimiseButton} aria-pressed={optimised} aria-describedby="optimise-details" disabled={sceneRestarting} onClick={toggleOptimisation}>
      {sceneRestarting ? 'Optimising…' : optimised ? 'Optimised' : 'Optimise'}
      <span id="optimise-details" className={styles.optimiseDetails}>30 FPS cap · lower resolution · lighter lighting and effects</span>
    </button>}
    {sceneRestarting&&<div className={styles.optimiseFade} role="status" aria-live="polite">Optimising performance…</div>}
    <output id="fps-meter" className={styles.fpsMeter} aria-label="Frame rate measuring">FPS —</output>
    <div style={{display:'contents'}} inert={aimingPaper ? '' : undefined} aria-hidden={aimingPaper ? true : undefined}>
    <div className={`${styles.scene}${sceneRestarting?` ${styles.sceneRestarting}`:''}`} onPointerMoveCapture={releaseKeyboardSelection} onPointerDownCapture={releaseKeyboardSelection} style={{pointerEvents:photo || entered || upliance ? 'none' : undefined}} aria-hidden={desktop} ref={enterButton} role="group" aria-label="Interactive room. Use arrow keys to select objects, Enter to activate, and Escape to return." tabIndex={photo || workBoard || desktop || outside || notebook || !!upliance ? -1 : 0}>
      <div hidden={photo || workBoard || desktop || outside || notebook || !!upliance} className={styles.sceneLabel}>VIKRAM’S WORKSPACE <span>{roomYear} / ENTER TO EXPLORE</span></div>
      <Boundary onEnter={()=>{preloadAboutJourney();setEntered(true);setDesktop(true);}}><Scene key={sceneRestartKey} roomYear={roomYear} optimised={optimised} paperInventory={paperInventory} onPickUpPaper={pickUpPaper} basketScore={basketScore} celebrating={celebrating} onBasket={onBasket} photo={photo} onPhotoOpen={openPhoto} workBoard={workBoard} workBoardTile={workBoardTile} onWorkBoardOpen={openWorkBoard} onWorkBoardTileSelect={selectWorkBoardTile} projectorState={projectorState} onProjectorChange={setProjectorState} onPlaybackChange={handlePlaybackChange} onCeilingPowerChange={setCeilingOn} onNotebookTear={tearPage} onPaperMotionChange={setPaperInFlight} aimingPaper={aimingPaper} heldPaper={heldPaper} paperControls={paperControls} onPaperThrown={onPaperThrown} tornPages={tornPages} keyboardTarget={keyboardTarget?.id} registerRoomAction={registerRoomAction} upliance={upliance} upliancePage={upliancePage} uplianceArrived={uplianceArrived} uplianceControlsRef={uplianceBack} onUplianceArrive={()=>setUplianceArrived(true)} onUplianceSelect={view=>{if(photo||workBoard||entered||outside||notebook||stickyNotes.editor||stickyNotes.placing)return;rememberFocus();setWearingGlasses(false);setUplianceArrived(false);setUpliance(view);}} propPlacement={propPlacement} glassesPlacement={glassesPlacement} stickyNotePlacement={stickyNotePlacement} lensSettings={lensSettings} noteEditorRef={noteEditorRef} stickyNotes={stickyNotes} wearingGlasses={wearingGlasses} glassesLens={glassesLens} glassesLeaving={glassesLeaving} onWearGlasses={wearGlasses} citySettings={citySettings} notebookOpen={notebookOpen} onNotebookPageChange={setNotebookPage} onNotebookExit={leaveNotebook} notebook={notebook} notebookPage={notebookPage} onNotebookOpen={openNotebook} onHover={handleHover} desktopRef={desktopRef} desktop={desktop} outside={outside} onCityReady={setCityReady} onWindowSelect={openWindow} lampOn={lampOn} onLampToggle={()=>setLampOn(value=>!value)} entered={entered} reduced={reduced} roomResetKey={roomResetKey} clock24Hour={clock24Hour} onClockToggle={()=>setClock24Hour(value=>!value)} onEnter={openMonitor} onArrive={()=>setDesktop(true)} /></Boundary>
      <div hidden={photo || workBoard || desktop || notebook || !!upliance} className={styles.enterRow}><RoomHoverLabel store={hoverStore} outside={outside} cityReady={cityReady} entered={entered}/></div>
    </div>
    <div className={`${transitionStyles.veil} ${transitionStyles[roomYearTransition]}`} aria-hidden="true"/>
    <div className={transitionStyles.status} role="status" aria-live="polite">{roomYearTransition==='idle'?'':`Changing the physical room to ${roomYearTarget}`}</div>
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
    {workBoard && <button ref={workBoardDismiss} type="button" className={styles.journeyRoomBack} onClick={closeWorkBoard}>{workBoardReturnToMonitor.current?'× Back to About Me':'← Back to desk'}</button>}
    {outside && <div className={styles.subwayToolbar}><span>{roomYear==='2021'?'OUTSIDE / DAYLIGHT CITY':roomYear==='2025'?'OUTSIDE / RAINY CITY':'OUTSIDE / NIGHT CITY'}</span><button ref={windowBack} onClick={leaveWindow}>{windowReturnToMonitor.current?'× Back to About Me':'← Back to desk'}</button></div>}
    {notebook && <>
      <button className={notebookReturnToMonitor.current ? styles.journeyRoomBack : styles.mobileNotebookBack} onClick={leaveNotebook}>{notebookReturnToMonitor.current ? '× Back to About Me' : '← Back to desk'}</button>
      <article ref={notebookText} tabIndex={-1} className={styles.screenReaderOnly} aria-label="Notebook page text. Use arrow keys to turn pages and Escape to return.">
        <h2>{notebookPages[notebookPage].title}</h2>
        <p>{notebookPages[notebookPage].text}</p>
        <p>{notebookPages[notebookPage].question}</p>
        <ul>{notebookPages[notebookPage].notes.map(note=><li key={note}>{note}</li>)}</ul>
        <p>{notebookPages[notebookPage].caption}</p>
      </article>
    </>}
    {!focused && <Link href="/"><a className={styles.homeLink} aria-label="Back to home">← Home</a></Link>}
    <DesktopZoomControl disabled={focused || aimingPaper || paperInFlight}/>
    <StickyNotesUI api={stickyNotes} elementRef={noteEditorRef}/>
    {wearingGlasses && <GlassesOverlay reduced={reduced} lens={glassesLens} onLeaving={()=>setGlassesLeaving(true)} onRemove={removeGlasses}/>}
    {/* Keep the projected desktop rendered during a throw: its inactive state freezes the open app in place. */}
    {/* Non-blur lens passes run in WebGL, so they use the static monitor surface instead of unfiltered projected HTML. */}
    {desktop && <button type="button" tabIndex={-1} className={styles.monitorDismiss} onClick={leave} aria-label="Click outside the monitor to return to the desk"/>}
    <section ref={desktopRef} className={`${styles.desktop} ${styles.monitorDesktop}`}
      style={{pointerEvents:desktop ? 'auto' : 'none', opacity:photo || outside || notebook || upliance || (wearingGlasses && glassesLens !== 'blur') ? 0 : 1}}
      inert={desktop ? undefined : ''} aria-hidden={!desktop} aria-label="Vikram’s monitor desktop">
      <DesktopWorkspace celebrating={celebrating} musicPlaying={musicPlaying} roomYear={roomYear} wallNotes={stickyNotes.notes} onRequestYear={requestRoomYear} projectorState={projectorState} onProjectorChange={setProjectorState} workBoardDetail={workBoardDetail} onWorkBoardDetailShown={()=>setWorkBoardDetail(null)} room={{lampOn,notebookOpen,notebookPage,wearingGlasses,cityReady,notesReady:stickyNotes.ready,noteCount:stickyNotes.notes.length}} desktopRef={desktopRef} interactive={desktop} visible={!photo&&!outside&&!notebook&&!upliance} reduced={reduced} exitRef={exitButton} onLeave={leave} onOpenUpliance={openUplianceFromMonitor} onOpenNotebook={openNotebookFromMonitor} onOpenNotes={openNotesFromMonitor} onOpenWindow={openWindowFromMonitor} onOpenWorkBoard={openWorkBoardFromMonitor} onToggleLamp={()=>roomActions.current.get('desk-lamp')?.()} lampOn={lampOn} onToggleRadio={toggleRadioFromMonitor} onToggleCeiling={()=>roomActions.current.get('ceiling-light')?.()} ceilingOn={ceilingOn} radioPlaying={radioPlaying} clock24Hour={clock24Hour} onClockToggle={()=>setClock24Hour(value=>!value)}/>
    </section>
    </div>
    {aimingPaper && <PaperFlick remaining={paperInventory.length} controls={paperControls} onCancel={() => { setAimingPaper(false); requestAnimationFrame(() => enterButton.current?.focus({preventScroll:true})); }}/>}
  </div>;
}
