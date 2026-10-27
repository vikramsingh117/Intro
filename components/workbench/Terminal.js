import { useEffect, useRef, useState } from 'react';
import { completeInput, createTerminalState, HOME, runCommand } from './terminalEngine.mjs';
import styles from '../../styles/Workbench.module.css';
import AdminView from './AdminView';

export default function Terminal({ onExit, windows }) {
  const [session,setSession]=useState(()=>createTerminalState());
  const [input,setInput]=useState('');
  const [entries,setEntries]=useState([]);
  const [admin,setAdmin]=useState(false), [authenticating,setAuthenticating]=useState(false);
  const authRequest=useRef(null);
  useEffect(()=>()=>authRequest.current?.abort(),[]);
  const historyIndex=useRef(null), draft=useRef(''), container=useRef(null);
  const displayPath=session.cwd===HOME?'~':session.cwd.startsWith(HOME+'/')?'~'+session.cwd.slice(HOME.length):session.cwd;
  const prompt=`vikram@workspace:${displayPath} $`;
  useEffect(()=>{
    const body=container.current?.parentElement;
    if(body)body.scrollTop=body.scrollHeight;
  },[entries]);
  const append=entry=>setEntries(current=>[...current,entry].slice(-150));
  const submit=async()=>{
    if(authRequest.current)return;
    if(!input.trim()){setInput('');return;}
    const login=input.trim().match(/^sudo\s+(\d+)$/);
    if(login){
      // Never put credentials in terminal output or command history.
      setInput('');historyIndex.current=null;draft.current='';
      const controller=new AbortController();authRequest.current=controller;setAuthenticating(true);
      const timeout=setTimeout(()=>controller.abort(),10000);
      try{
        const response=await fetch('/api/admin/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:login[1]}),signal:controller.signal});
        const result=await response.json();
        if(!response.ok)throw Error(result.error || 'Sign-in failed.');
        if(!controller.signal.aborted)setAdmin(true);
      }catch(error){append({output:error.name==='AbortError'?'Sign-in cancelled or timed out.':error.message});}
      finally{clearTimeout(timeout);authRequest.current=null;setAuthenticating(false);}
      return;
    }
    const result=runCommand(input,session,Date.now(),{windows});
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
      event.preventDefault();append({prompt,input:/^sudo\s+\d/.test(input.trim())?'sudo [hidden]^C':input+'^C'});setInput('');historyIndex.current=null;
    }
  };
  if(admin)return <AdminView onClose={()=>setAdmin(false)}/>;
  return <div ref={container} className={styles.terminalSession}>
    <p className={styles.terminalWelcome}>Vikram’s terminal</p>
    <p className={styles.terminalNote}>Simulated Linux · session-only files · type help</p>
    <div role="log" aria-label="Terminal output" aria-live="polite" aria-relevant="additions">
      {entries.map((entry,index)=><div className={styles.terminalEntry} key={index}>
        {entry.prompt&&<div className={styles.terminalCommand}><span>{entry.prompt}</span> {entry.input}</div>}
        {entry.output&&<pre>{entry.output}</pre>}
      </div>)}
    </div>
    {authenticating&&<p role="status">Authenticating…</p>}
    <label className={styles.terminalPrompt}><span aria-hidden="true">{prompt}</span><input aria-label="Terminal command" type={/^sudo\s+\d/.test(input.trim())?'password':'text'} disabled={authenticating} enterKeyHint="send" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={1024} value={input}
      onChange={event=>{setInput(event.target.value);historyIndex.current=null;}} onKeyDown={keyDown}/></label>
  </div>;
}
