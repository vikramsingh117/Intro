import { useRef, useState } from 'react';
import PortfolioApps, { PROFILE_LINKS } from './PortfolioApps';
import Terminal from './Terminal';
import AssetCredits from './AssetCredits';
import DesktopWindow from './DesktopWindow';
import styles from '../../styles/Workbench.module.css';

const apps=[['My Work','▰'],['About Me','◉'],['Projects','⌘'],['Terminal','>_'],['Credits','ⓘ']];
export default function DesktopWorkspace({ desktopRef, interactive, exitRef, onLeave }) {
  const [windows,setWindows]=useState([]);
  const shortcuts=useRef({});
  const top=windows.filter(window=>!window.minimized).at(-1)?.title;
  const focus=title=>setWindows(current=>{
    const index=current.findIndex(window=>window.title===title);
    if(index<0 || (index===current.length-1 && !current[index].minimized))return current;
    return [...current.filter(window=>window.title!==title),{...current[index],minimized:false}];
  });
  const open=title=>setWindows(current=>[...current.filter(window=>window.title!==title),{title,minimized:false}]);
  const close=title=>{setWindows(current=>current.filter(window=>window.title!==title));requestAnimationFrame(()=>shortcuts.current[title]?.focus());};
  const minimize=title=>{setWindows(current=>current.map(window=>window.title===title?{...window,minimized:true}:window));requestAnimationFrame(()=>shortcuts.current[title]?.focus());};
  return <div className={styles.desktopWorkspace} onKeyDown={event=>{if(event.key==='Escape'&&top){event.preventDefault();event.stopPropagation();close(top);}}}>
    <div className={styles.desktopTop}><span>VIKRAM / BEYOND HOURS</span><button ref={exitRef} onClick={onLeave}>← Back to desk</button></div>
    <div className={styles.shortcuts}>{apps.map(([title,icon])=><button key={title} ref={node=>{shortcuts.current[title]=node;}} onClick={()=>open(title)}><span className={styles.appIcon} data-app={title}>{icon}</span>{title}</button>)}
      {PROFILE_LINKS.map(link=><a key={link.title} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.title} profile (opens in a new tab)`}><span className={styles.appIcon} data-app={link.title}>{link.icon}</span>{link.title}<small className={styles.externalAppArrow} aria-hidden="true">↗</small></a>)}
      <a href="mailto:vikramandanshu@gmail.com" aria-label="Email Vikram"><span className={styles.appIcon} data-app="Email">@</span>Email</a>
    </div>
    {windows.map((window,index)=><DesktopWindow key={window.title} title={window.title} desktopRef={desktopRef} active={interactive && top===window.title} minimized={window.minimized} zIndex={index+2}
      onFocus={()=>focus(window.title)} onClose={()=>close(window.title)} onMinimize={()=>minimize(window.title)}>
      {window.title==='Terminal'?<Terminal onExit={()=>close('Terminal')}/>:window.title==='Credits'?<AssetCredits/>:<PortfolioApps title={window.title}/>}
    </DesktopWindow>)}
    <footer className={styles.taskbar}><button onClick={()=>open('My Work')} aria-label="Open My Work">▦</button><span>Vikram’s workspace</span>{windows.map(window=><button key={window.title} aria-pressed={!window.minimized && top===window.title} onClick={()=>focus(window.title)}>{window.title}</button>)}<span className={styles.taskbarRight}>PRODUCT · AI · ENGINEERING</span></footer>
  </div>;
}
