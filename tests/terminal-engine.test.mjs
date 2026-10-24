import test from 'node:test';
import assert from 'node:assert/strict';
import { createTerminalState, runCommand, completeInput, HOME } from '../components/workbench/terminalEngine.mjs';

test('paths resolve relative, home, root and previous directories',()=>{
  let state=createTerminalState(0);
  state=runCommand('cd projects',state).state;
  assert.equal(state.cwd,HOME+'/projects');
  assert.match(runCommand('cat upliance.txt',state).output,/ADK/);
  state=runCommand('cd -',state).state;assert.equal(state.cwd,HOME);
  state=runCommand('cd ../../../../..',state).state;assert.equal(state.cwd,'/');
  state=runCommand('cd',state).state;assert.equal(state.cwd,HOME);
  assert.equal(runCommand('cd missing',state).state.cwd,HOME);
});
test('quoted arguments work and shell operators are not executed',()=>{
  const state=createTerminalState();
  assert.equal(runCommand('echo "hello world" \'a|b\' ""',state).output,'hello world a|b ');
  assert.match(runCommand('echo "unfinished',state).output,/unclosed quote/);
  assert.match(runCommand('cat about.txt | wc',state).output,/not supported/);
  assert.match(runCommand('whoami; rm about.txt',state).output,/not supported/);
  assert.match(runCommand('constructor',state).output,/command not found/);
});
test('virtual filesystem mutations are isolated to the session',()=>{
  const initial=createTerminalState();let state=runCommand('mkdir scratch',initial).state;
  state=runCommand('touch scratch/test.txt',state).state;
  assert.equal(state.fs[HOME+'/scratch/test.txt'],'');
  assert.equal(initial.fs[HOME+'/scratch'],undefined);
  assert.match(runCommand('tree scratch',state).output,/test.txt/);
  state=runCommand('rm scratch/test.txt',state).state;
  assert.equal(Object.hasOwn(state.fs,HOME+'/scratch/test.txt'),false);
  assert.match(runCommand('rm scratch',state).output,/Is a directory/);
  assert.match(runCommand('rm -rf',state).output,/recursive removal/);
  assert.equal(Object.hasOwn(createTerminalState().fs,HOME+'/scratch'),false);
});
test('ls hidden files, reading, filtering and counting',()=>{
  const state=createTerminalState();
  assert.doesNotMatch(runCommand('ls',state).output,/\.profile/);
  assert.match(runCommand('ls -la',state).output,/\.profile/);
  assert.equal(runCommand('head -n 1 about.txt',state).output,'Vikram Singh');
  assert.equal(runCommand('tail -n 0 about.txt',state).output,'');
  assert.match(runCommand('grep -in engineer about.txt',state).output,/2:AI Product Engineer/);
  assert.equal(runCommand('wc -l about.txt',state).output,'3 about.txt');
  assert.match(runCommand('head -n -1 about.txt',state).output,/0–1000/);
  assert.match(runCommand('cat projects',state).output,/Is a directory/);
});
test('ping clearly identifies simulated output and bounds count',()=>{
  const state=createTerminalState();const output=runCommand('ping -c 2 example.com',state).output;
  assert.match(output,/SIMULATED, no network request/);
  assert.equal((output.match(/icmp_seq=/g)||[]).length,2);
  assert.match(runCommand('ping -c 999 example.com',state).output,/1–10/);
  assert.match(runCommand('ping https://example.com',state).output,/hostname or IP/);
});
test('completion works for commands and relative paths',()=>{
  const state=createTerminalState();
  assert.equal(completeInput('who',state).input,'whoami ');
  assert.equal(completeInput('cd pro',state).input,'cd projects/');
  assert.equal(completeInput('cat projects/u',state).input,'cat projects/upliance.txt ');
  assert(completeInput('c',state).matches.includes('cat'));
});
test('history, clear, exit, uptime and limits',()=>{
  let state=createTerminalState(0);
  state=runCommand('whoami',state).state;
  const history=runCommand('history',state);assert.match(history.output,/whoami/);assert.match(history.output,/history/);
  assert.equal(runCommand('clear',state).action,'clear');assert.equal(runCommand('exit',state).action,'exit');
  assert.match(runCommand('uptime',state,120000).output,/2 minutes/);
  assert.match(runCommand('help',state).output,/ping/);
  assert.match(runCommand('man ping',state).output,/simulated/);
  for(let i=0;i<110;i++)state=runCommand('whoami',state).state;
  assert.equal(state.history.length,100);
});
