import { useEffect, useRef, useState } from 'react';
import { completeInput, createTerminalState, HOME, runCommand } from './terminalEngine.mjs';
import styles from '../../styles/Workbench.module.css';

export default function Terminal({ onExit }) {
  const [session,setSession]=useState(()=>createTerminalState());
  const [input,setInput]=useState('');
  const [entries,setEntries]=useState([]);
  const historyIndex=useRef(null), draft=useRef(''), container=useRef(null);
  const displayPath=session.cwd===HOME?'~':session.cwd.startsWith(HOME+'/')?'~'+session.cwd.slice(HOME.length):session.cwd;
  const prompt=`vikram@workspace:${displayPath} $`;
  useEffect(()=>{
    const body=container.current?.parentElement;
    if(body)body.scrollTop=body.scrollHeight;
  },[entries]);
  const append=entry=>setEntries(current=>[...current,entry].slice(-150));
  const submit=()=>{
    if(!input.trim()){setInput('');return;}
    const result=runCommand(input,session);
    setSession(result.state);setInput('');historyIndex.current=null;draft.current='';
    if(result.action==='clear')setEntries([]);
    else append({prompt,input,output:result.output});
    if(result.action==='exit')onExit();
  };
  const keyDown=event=>{
    if(event.key==='Enter'){event.preventDefault();submit();}
    else if(event.key==='ArrowUp'||event.key==='ArrowDown'){
      event.preventDefault();if(!session.history.length)return;
      if(historyIndex.current===null){draft.current=input;historyIndex.current=session.history.length;}
      historyIndex.current=Math.max(0,Math.min(session.history.length,historyIndex.current+(event.key==='ArrowUp'?-1:1)));
      setInput(historyIndex.current===session.history.length?draft.current:session.history[historyIndex.current]);
    } else if(event.key==='Tab'&&!event.shiftKey){
      event.preventDefault();const completion=completeInput(input,session);setInput(completion.input);
      if(completion.matches.length)append({output:completion.matches.join('  ')});
    } else if(event.ctrlKey&&event.key.toLowerCase()==='l'){
      event.preventDefault();setEntries([]);
    } else if(event.ctrlKey&&event.key.toLowerCase()==='c'&&event.currentTarget.selectionStart===event.currentTarget.selectionEnd){
      event.preventDefault();append({prompt,input:input+'^C'});setInput('');historyIndex.current=null;
    }
  };
  return <div ref={container} className={styles.terminalSession}>
    <p className={styles.terminalWelcome}>Vikram’s terminal</p>
    <p className={styles.terminalNote}>Simulated Linux · session-only files · type help</p>
    <div role="log" aria-label="Terminal output" aria-live="polite" aria-relevant="additions">
      {entries.map((entry,index)=><div className={styles.terminalEntry} key={index}>
        {entry.prompt&&<div className={styles.terminalCommand}><span>{entry.prompt}</span> {entry.input}</div>}
        {entry.output&&<pre>{entry.output}</pre>}
      </div>)}
    </div>
    <label className={styles.terminalPrompt}><span aria-hidden="true">{prompt}</span><input aria-label="Terminal command" enterKeyHint="send" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={1024} value={input}
      onChange={event=>{setInput(event.target.value);historyIndex.current=null;}} onKeyDown={keyDown}/></label>
  </div>;
}
