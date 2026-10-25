import { useState } from 'react';
import styles from '../../styles/Workbench.module.css';

export default function TaskManager({ windows, activeTitle, onFocus, onClose, room = {} }) {
  const [tab,setTab]=useState('apps');
  const components=[
    ['Monitor','Interactive desktop'],['Desk & drawers','Top drawer opens to reveal glasses'],
    ['Desk lamp',room.lampOn?'On':'Off'],['Notebook',room.notebookOpen?`Open · spread ${(room.notebookPage || 0)+1}`:'Closed'],
    ['Glasses',room.wearingGlasses?'Wearing':'In drawer'],['Shared wall',room.notesReady?`${room.noteCount} notes`:'Connecting'],
    ['Sticky note pad','Write and place notes'],['Window / city',room.cityReady?'Loaded':'Loading'],
    ['Airplane','Flyby visible from window'],['Radio','Music playback'],['Ceiling light','Toggleable lighting'],
    ['Keyboard','Decorative'],['Chair','Decorative'],['Plant','Decorative'],['Room','Walls, ceiling & floor'],
  ];
  return <section className={styles.taskManager} aria-label="Task Manager">
    <nav aria-label="Task Manager views">{[['apps',`Apps (${windows.length})`],['room',`Room components (${components.length})`]].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    <p>{tab==='apps'?'Open desktop apps. Ending a task closes its window and clears its unsaved state.':'Scene inventory. Live states are shown where available; decorative objects stay in the scene.'}</p>
    <ul>{tab==='apps'?windows.map(app=><li key={app.title}>
      <div><strong>{app.title}</strong><span>{app.minimized?'Minimized':app.title===activeTitle?'Active':'Open'}</span></div>
      <div className={styles.taskActions}><button onClick={()=>onFocus(app.title)} disabled={app.title===activeTitle}>Switch to</button><button onClick={()=>onClose(app.title)}>End task</button></div>
    </li>):components.map(([name,state])=><li key={name}><div><strong>{name}</strong><span>{state}</span></div></li>)}</ul>
  </section>;
}
