export const HOME = '/home/vikram';
const MANUAL = {
  help:'help — list supported commands', whoami:'whoami — print the current user',
  pwd:'pwd — print the working directory', ls:'ls [-a] [-l] [path] — list files',
  cd:'cd [path | -] — change directory; defaults to ~', cat:'cat FILE... — print files',
  head:'head [-n COUNT] FILE — first lines', tail:'tail [-n COUNT] FILE — last lines',
  grep:'grep [-i] [-n] PATTERN FILE — find literal text', wc:'wc [-l | -w | -c] FILE — count lines, words or bytes',
  tree:'tree [directory] — show the directory tree', echo:'echo [text...] — print text (quotes supported)',
  mkdir:'mkdir NAME — create a session-only directory', touch:'touch FILE — create a session-only empty file',
  rm:'rm FILE — remove a virtual file (directories and recursive removal are not supported)',
  date:'date — show your browser’s current date and time', uname:'uname [-a] — simulated system information',
  hostname:'hostname — print the simulated host name', id:'id — print simulated user and group IDs',
  uptime:'uptime — time since this terminal session started',
  ping:'ping [-c 1..10] HOST — simulated replies; no DNS lookup or network requests',
  history:'history — show this session’s commands', clear:'clear — clear the display',
  man:'man COMMAND — show command usage', exit:'exit — close the terminal window',
};
export const COMMANDS = Object.keys(MANUAL).sort();
export function createTerminalState(now=Date.now()) {
  return {cwd:HOME, previous:HOME, started:now, history:[], fs:{
    '/':null,'/home':null,[HOME]:null,[`${HOME}/projects`]:null,[`${HOME}/notes`]:null,
    [`${HOME}/readme.txt`]:'Welcome to Vikram’s workspace.\nThis is a simulated Linux terminal, running in your browser.\nTry: ls, cat about.txt, cd projects, or help.\nFiles and changes last for this terminal session only.\n',
    [`${HOME}/about.txt`]:'Vikram Singh\nAI Product Engineer\nI work across product decisions, user experience, AI integration, and production systems.\n',
    [`${HOME}/projects/upliance.txt`]:'Upliance / Frodo\nAI cooking experiences: ADK chatbot integration and recipe-generation actions.\nDiscovery: device-aware recipes, diet/allergen preferences, scroll restoration.\nOperations: chatbot-session inspection, recipe-generation timing, document synchronization.\n',
    [`${HOME}/notes/product.txt`]:'What should happen next for the person using this?\nWhat context should the product remember?\nCan the team understand what just happened?\n',
    [`${HOME}/.profile`]:'USER=vikram\nHOSTNAME=workspace\nHOME=/home/vikram\n',
  }};
}
export function resolvePath(path='~', cwd=HOME) {
  const expanded=path==='~'?HOME:path.startsWith('~/')?HOME+path.slice(1):path;
  const parts=[];
  for(const part of (expanded.startsWith('/')?expanded:`${cwd}/${expanded}`).split('/')) {
    if(!part||part==='.')continue;
    if(part==='..')parts.pop();else parts.push(part);
  }
  return '/'+parts.join('/');
}
function tokens(line) {
  const result=[]; let word='',quote='',started=false;
  for(let i=0;i<line.length;i++) {
    const ch=line[i];
    if(ch==='\\' && quote!=="'") { if(i+1===line.length)throw Error('unfinished escape');word+=line[++i];started=true; }
    else if(quote) { if(ch===quote)quote='';else word+=ch; }
    else if(ch==='"'||ch==="'") {quote=ch;started=true;}
    else if(/\s/.test(ch)) {if(started){result.push(word);word='';started=false;}}
    else if('|;&<>'.includes(ch))throw Error('Pipes, redirects, and command chaining are not supported yet.');
    else {word+=ch;started=true;}
  }
  if(quote)throw Error('unclosed quote');
  if(started)result.push(word);
  return result;
}
const exists=(fs,path)=>Object.prototype.hasOwnProperty.call(fs,path);
function children(fs,path) {
  const prefix=path==='/'?'/':path+'/';
  return Object.keys(fs).filter(key=>key.startsWith(prefix)&&key!==path&&!key.slice(prefix.length).includes('/')).sort();
}
export function runCommand(line,state,now=Date.now()) {
  const next={...state,history:[...state.history,line].slice(-100),fs:{...state.fs}};
  const result=(output='',action)=>({state:next,output:String(output).slice(0,20000),action});
  const fail=message=>{throw Error(message);};
  let command;
  try {
    const parts=tokens(line); command=parts.shift(); const args=parts;
    if(!command)return {state,output:''};
    if(!Object.prototype.hasOwnProperty.call(MANUAL,command))return result(`${command}: command not found. Type help.`);
    if(args.includes('--help'))return result(MANUAL[command]);
    const path=value=>resolvePath(value,next.cwd);
    const read=value=>{const name=path(value);if(!exists(next.fs,name))fail(`${value}: No such file`);if(next.fs[name]===null)fail(`${value}: Is a directory`);return next.fs[name];};
    const dir=value=>{const name=path(value);if(!exists(next.fs,name)||next.fs[name]!==null)fail(`${value}: Not a directory`);return name;};
    const requireCount=(min,max=min)=>{if(args.length<min||args.length>max)fail(MANUAL[command]);};
    if(command==='help')return result('Simulated Linux terminal · no server access\n\n'+COMMANDS.map(name=>MANUAL[name]).join('\n')+'\n\n↑/↓ history · Tab completion · Ctrl+L clear · Ctrl+C cancel input');
    if(command==='man'){requireCount(1);return result(Object.prototype.hasOwnProperty.call(MANUAL,args[0])?MANUAL[args[0]]:`No manual entry for ${args[0]}`);}
    if(command==='whoami')return result('vikram');
    if(command==='hostname')return result('workspace');
    if(command==='id')return result('uid=1000(vikram) gid=1000(vikram) groups=1000(vikram) [simulated]');
    if(command==='uname')return result(args.includes('-a')?'Linux workspace 1.0.0 portfolio-sim browser GNU/Linux (simulated)':'Linux (simulated)');
    if(command==='date')return result(new Date(now).toString());
    if(command==='uptime')return result(`up ${Math.floor((now-state.started)/60000)} minutes, 1 simulated user`);
    if(command==='pwd')return result(next.cwd);
    if(command==='echo')return result(args.join(' '));
    if(command==='history')return result(next.history.map((entry,i)=>`${String(i+1).padStart(3)}  ${entry}`).join('\n'));
    if(command==='clear'||command==='exit')return result('',command);
    if(command==='cd'){
      requireCount(0,1);const target=args[0]==='-'?next.previous:path(args[0]||'~');
      dir(target);next.previous=next.cwd;next.cwd=target;return result(args[0]==='-'?target:'');
    }
    if(command==='ls'){
      let all=false,long=false;const paths=[];
      for(const arg of args){if(arg.startsWith('-')){if(!/^-[al]+$/.test(arg))fail(`unsupported option ${arg}`);all ||= arg.includes('a');long ||= arg.includes('l');}else paths.push(arg);}
      if(paths.length>1)fail(MANUAL.ls);
      const target=path(paths[0]||'.');if(!exists(next.fs,target))fail(`${paths[0]}: No such file or directory`);
      const entries=next.fs[target]===null?children(next.fs,target):[target];
      return result(entries.filter(name=>all||!name.split('/').at(-1).startsWith('.')).map(name=>{
        const isDir=next.fs[name]===null,label=name.split('/').at(-1)+(isDir?'/':'');
        return long?`${isDir?'drwxr-xr-x':'-rw-r--r--'} vikram ${String(isDir?0:new TextEncoder().encode(next.fs[name]).length).padStart(5)} ${label}`:label;
      }).join(long?'\n':'  '));
    }
    if(command==='tree'){
      requireCount(0,1);const base=dir(args[0]||'.'), lines=[base];
      const walk=(root,prefix,depth)=>{if(depth>12)return;const list=children(next.fs,root);list.forEach((name,i)=>{const last=i===list.length-1;lines.push(prefix+(last?'└── ':'├── ')+name.split('/').at(-1));if(next.fs[name]===null)walk(name,prefix+(last?'    ':'│   '),depth+1);});};
      walk(base,'',0);return result(lines.join('\n'));
    }
    if(command==='cat'){requireCount(1,10);return result(args.map(read).join(''));}
    if(command==='head'||command==='tail'){
      let count=10;if(args[0]==='-n'){args.shift();count=Number(args.shift());}
      if(!Number.isInteger(count)||count<0||count>1000)fail('line count must be 0–1000');requireCount(1);
      const lines=read(args[0]).replace(/\n$/,'').split('\n');return result((count===0?[]:command==='head'?lines.slice(0,count):lines.slice(-count)).join('\n'));
    }
    if(command==='grep'){
      let insensitive=false,numbers=false;
      while(args[0]?.startsWith('-')){const option=args.shift();if(!/^-[in]+$/.test(option))fail('supported options: -i -n');insensitive ||= option.includes('i');numbers ||= option.includes('n');}
      requireCount(2);const [pattern,file]=args;
      return result(read(file).split('\n').map((text,index)=>({text,index})).filter(({text})=>insensitive?text.toLowerCase().includes(pattern.toLowerCase()):text.includes(pattern)).map(({text,index})=>(numbers?`${index+1}:`:'')+text).join('\n'));
    }
    if(command==='wc'){
      const flag=args[0]?.startsWith('-')?args.shift():null;if(flag&&!['-l','-w','-c'].includes(flag))fail(MANUAL.wc);requireCount(1);
      const text=read(args[0]),counts=[(text.match(/\n/g)||[]).length,(text.match(/\S+/g)||[]).length,new TextEncoder().encode(text).length];
      return result(`${flag?counts[['-l','-w','-c'].indexOf(flag)]:counts.join(' ')} ${args[0]}`);
    }
    if(['mkdir','touch','rm'].includes(command)){
      requireCount(1);if(args[0].startsWith('-'))fail(MANUAL[command]);const target=path(args[0]);
      if(command==='rm'){read(args[0]);delete next.fs[target];return result();}
      dir(target.slice(0,target.lastIndexOf('/'))||'/');
      if(exists(next.fs,target)){if(command==='touch'&&next.fs[target]!==null)return result();fail(`${args[0]}: File exists`);}
      if(Object.keys(next.fs).length>=100)fail('session file limit reached');next.fs[target]=command==='mkdir'?null:'';return result();
    }
    if(command==='ping'){
      let count=4;if(args[0]==='-c'){args.shift();count=Number(args.shift());}
      requireCount(1);if(!Number.isInteger(count)||count<1||count>10)fail('count must be 1–10');
      const host=args[0];if(!/^[a-zA-Z0-9][a-zA-Z0-9.:-]{0,252}$/.test(host))fail('provide a hostname or IP address');
      return result(`PING ${host} — SIMULATED, no network request\n`+Array.from({length:count},(_,i)=>`64 bytes from ${host}: icmp_seq=${i+1} ttl=64 time=${(12+i*.7).toFixed(1)} ms`).join('\n')+`\n--- ${host} simulated statistics ---\n${count} packets transmitted, ${count} received, 0% packet loss`);
    }
    return result(`${command}: not implemented`);
  } catch(error) {return result(`${command||'shell'}: ${error.message}`);}
}
export function completeInput(input,state) {
  if(/["'\\|;&<>]/.test(input))return {input,matches:[]};
  const parts=input.split(/\s+/),word=parts.at(-1);
  let matches;
  if(parts.length===1)matches=COMMANDS.filter(name=>name.startsWith(word));
  else {
    const slash=word.lastIndexOf('/'),prefix=slash>=0?word.slice(0,slash+1):'';
    const base=resolvePath(prefix||'.',state.cwd),fragment=word.slice(slash+1);
    matches=children(state.fs,base).filter(name=>name.split('/').at(-1).startsWith(fragment)).map(name=>prefix+name.split('/').at(-1)+(state.fs[name]===null?'/':''));
  }
  if(matches.length===1)return {input:input.slice(0,input.length-word.length)+matches[0]+(matches[0].endsWith('/')?'':' '),matches:[]};
  return {input,matches};
}
