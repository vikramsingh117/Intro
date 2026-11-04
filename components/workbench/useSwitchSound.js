import { useCallback, useEffect, useRef } from 'react';

export default function useSwitchSound() {
  const audio=useRef(null);
  useEffect(()=>()=>{
    const context=audio.current;
    audio.current=null;
    if(context&&context.state!=='closed')context.close().catch(()=>{});
  },[]);
  return useCallback(on=>{
    try {
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext)return;
      const context=audio.current||(audio.current=new AudioContext());
      const play=()=>{
        if(audio.current!==context||context.state!=='running')return;
        const duration=.065,buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
        const samples=buffer.getChannelData(0);
        for(let i=0;i<samples.length;i++){
          const t=i/context.sampleRate;
          const snap=Math.exp(-t*240)+.45*Math.exp(-Math.max(0,t-.018)*280)*(t>=.018?1:0);
          samples[i]=(Math.random()*2-1)*snap;
        }
        const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
        source.buffer=buffer;filter.type='bandpass';filter.frequency.value=on?2400:1700;filter.Q.value=.7;
        gain.gain.value=.22;
        source.connect(filter);filter.connect(gain);gain.connect(context.destination);
        source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
        source.start();
      };
      if(context.state==='running')play();else context.resume().then(play).catch(()=>{});
    } catch {} // Audio availability must never prevent a light from toggling.
  },[]);
}
