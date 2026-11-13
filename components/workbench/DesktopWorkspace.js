import { trackInteraction } from '../../lib/visitor-analytics';
import { useCallback, useEffect, useRef, useState } from 'react';
import DesktopContextMenu from './DesktopContextMenu';
import localPoint from './desktopPoint';
import PortfolioApps, { PROFILE_LINKS } from './PortfolioApps';
import Terminal from './Terminal';
import Photos from './Photos';
import TaskManager from './TaskManager';
import AssetCredits, { FireflyCredit } from './AssetCredits';
import AboutChat from '../AboutChat';
import DesktopWindow from './DesktopWindow';
import DesktopMascot from './DesktopMascot';
import GitHubSnapshot from './GitHubSnapshot';
import LeetCodeSnapshot from './LeetCodeSnapshot';
import styles from '../../styles/Workbench.module.css';

const apps=[['My Work','▰'],['Projects','⌘'],['AI Assistant','✳'],['Terminal','>_'],['Credits','ⓘ'],['Task Manager','▥'],['Photos','▧']];
function AboutIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#f3d99d" d="M24 8l4 6 7 2-5 5 1 8-7-4-7 4 1-8-5-5 7-2z" opacity=".35"/>
    <circle cx="24" cy="19" r="7" fill="#f5dfb6"/>
    <path fill="#244b4c" d="M17 18c1-7 13-8 15 0-4-1-8-3-11-6-1 3-2 5-4 6z"/>
    <path fill="#f5dfb6" d="M11 40c1-9 6-13 13-13s12 4 13 13z"/>
    <path fill="#8cc6ae" d="M17 30l7 6 7-6c3 2 5 5 6 10H11c1-5 3-8 6-10z"/>
    <path fill="#f5ca68" d="M38 7h2v8h-2zm-3 3h8v2h-8z"/>
  </svg>;
}
export default function DesktopWorkspace({ desktopRef, interactive, visible=true, reduced=false, exitRef, onLeave, onOpenUpliance, onOpenNotebook, onOpenNotes, onToggleRadio, onToggleCeiling, ceilingOn, radioPlaying, room, musicPlaying=false }) {
  const [windows,setWindows]=useState([]);
  const [menu,setMenu]=useState(null);
  const [iconsVisible,setIconsVisible]=useState(true);
  const [refreshTick,setRefreshTick]=useState(0);
  const workspace=useRef(null);
  const mascot=useRef(null);
  const closeMenu=useCallback(restore=>{setMenu(null);if(restore)workspace.current?.focus({preventScroll:true});},[]);
  useEffect(()=>{if(!interactive)setMenu(null);},[interactive]);
  const contextMenu=event=>{
    if(!interactive || event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    event.preventDefault();event.stopPropagation();
    const width=workspace.current.offsetWidth;
    const point=localPoint(desktopRef.current,event);
    setMenu({x:point.x-(1280-width)/2,y:point.y,width});
  };
  const shortcuts=useRef({});
  const top=windows.filter(window=>!window.minimized).at(-1)?.title;
  const focus=title=>setWindows(current=>{
    const index=current.findIndex(window=>window.title===title);
    if(index<0 || (index===current.length-1 && !current[index].minimized))return current;
    return [...current.filter(window=>window.title!==title),{...current[index],minimized:false}];
  });
  const open=title=>{
    mascot.current?.cancel();mascot.current?.markSeen(title);
    trackInteraction('app_open',title);
    setWindows(current=>[...current.filter(window=>window.title!==title),{title,minimized:false}]);
  };
  const close=title=>{mascot.current?.cancel();trackInteraction('app_close',title);setWindows(current=>current.filter(window=>window.title!==title));requestAnimationFrame(()=>shortcuts.current[title]?.focus());};
  const minimize=title=>{mascot.current?.cancel();trackInteraction('app_minimize',title);setWindows(current=>current.map(window=>window.title===title?{...window,minimized:true}:window));requestAnimationFrame(()=>shortcuts.current[title]?.focus());};
  return <div ref={workspace} tabIndex={-1} className={styles.desktopWorkspace} onContextMenu={contextMenu} onKeyDown={event=>{if((event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10'))&&interactive){event.preventDefault();event.stopPropagation();setMenu({x:24,y:100,width:workspace.current.offsetWidth});return;}if(event.key==='Escape'&&top){event.preventDefault();event.stopPropagation();close(top);}}}>
    <div className={styles.desktopTop}><span>VIKRAM / BEYOND HOURS</span><button ref={exitRef} onClick={onLeave}>← Back to desk</button></div>
    <div key={refreshTick} className={`${styles.shortcuts} ${styles.desktopIconsFresh}`} style={{visibility:iconsVisible?undefined:'hidden'}}>{apps.map(([title,icon])=><button key={title} ref={node=>{shortcuts.current[title]=node;}} onClick={()=>open(title)}><span className={styles.appIcon} data-app={title}>{icon}</span>{title}</button>)}
      {PROFILE_LINKS.map(link=>link.title==='GitHub'||link.title==='LeetCode'?<button key={link.title} ref={node=>{shortcuts.current[link.title]=node;}} onClick={()=>open(link.title)} aria-label={`Open ${link.title}`}><span className={styles.appIcon} data-app={link.title}>{link.icon}</span>{link.title}</button>:<a key={link.title} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.title} profile (opens in a new tab)`}><span className={styles.appIcon} data-app={link.title}>{link.icon}</span>{link.title}<small className={styles.externalAppArrow} aria-hidden="true">↗</small></a>)}
      <a href="mailto:vikramandanshu@gmail.com" aria-label="Email Vikram"><span className={styles.appIcon} data-app="Email">@</span>Email</a>
    </div>
    <button key={`about-${refreshTick}`} className={`${styles.desktopShortcut} ${styles.aboutShortcut} ${styles.desktopIconsFresh}`} style={{visibility:iconsVisible?undefined:'hidden'}} ref={node=>{shortcuts.current['About Me']=node;}} onClick={()=>open('About Me')}><span className={styles.appIcon} data-app="About Me"><AboutIcon/></span>About Me</button>
    <DesktopMascot ref={mascot} interactive={interactive} visible={visible} reduced={reduced} hasWindow={!!top} musicPlaying={musicPlaying}/>
    {windows.map((window,index)=><DesktopWindow key={window.title} title={window.title} desktopRef={desktopRef} active={interactive && top===window.title} minimized={window.minimized} zIndex={index+2}
      onFocus={()=>focus(window.title)} onClose={()=>close(window.title)} onMinimize={()=>minimize(window.title)}>
      {window.title==='AI Assistant'?<AboutChat theme="dark" embedded active={interactive && !window.minimized && top===window.title}/>:window.title==='Photos'?<Photos active={interactive && !window.minimized && top===window.title}/>:window.title==='Task Manager'?<TaskManager windows={windows} activeTitle={top} onFocus={focus} onClose={close} room={room}/>:window.title==='Terminal'?<Terminal windows={windows} onExit={()=>close('Terminal')}/>:window.title==='Credits'?<><AssetCredits/><FireflyCredit/></>:window.title==='GitHub'?<GitHubSnapshot/>:window.title==='LeetCode'?<LeetCodeSnapshot desktop/>:<PortfolioApps title={window.title} onOpenUpliance={onOpenUpliance} onOpenNotebook={onOpenNotebook} onOpenNotes={onOpenNotes} onToggleRadio={onToggleRadio} onToggleCeiling={onToggleCeiling} ceilingOn={ceilingOn} onEnterPortfolio={()=>{close('About Me');onLeave();}} radioPlaying={radioPlaying}/>}
    </DesktopWindow>)}
    {menu && interactive && <DesktopContextMenu point={menu} width={menu.width} iconsVisible={iconsVisible} onClose={closeMenu}
      onToggleIcons={()=>setIconsVisible(value=>!value)} onRefresh={()=>setRefreshTick(value=>value+1)} onOpen={open}
      hasWindows={windows.some(window=>!window.minimized)} onShowDesktop={()=>setWindows(current=>current.map(window=>({...window,minimized:true})))}/>}
    <footer className={styles.taskbar}><button onClick={()=>open('My Work')} aria-label="Open My Work">▦</button><span>Vikram’s workspace</span>{windows.map(window=><button key={window.title} aria-pressed={!window.minimized && top===window.title} onClick={()=>{mascot.current?.cancel();focus(window.title);}}>{window.title}</button>)}<span className={styles.taskbarRight}>PRODUCT · AI · ENGINEERING</span></footer>
  </div>;
}
