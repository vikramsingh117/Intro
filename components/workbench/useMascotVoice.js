import { useCallback, useEffect, useRef } from 'react';
import { createMascotLetter, mascotLetterIndex } from './mascotVoice.mjs';

export default function useMascotVoice() {
  const audio = useRef(null);
  const buffers = useRef(new Map());
  const sources = useRef(new Set());
  const unlock = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = audio.current || (audio.current = new AudioContext());
      if (context.state === 'suspended') context.resume().catch(() => {});
    } catch {} // Dialogue remains usable when sound is unavailable.
  }, []);
  const stop = useCallback(() => {
    sources.current.forEach(source => { try { source.stop(); } catch {} source.disconnect(); });
    sources.current.clear();
  }, []);
  const playLetter = useCallback(character => {
    const index = mascotLetterIndex(character), context = audio.current;
    if (index < 0 || !context || context.state !== 'running' || document.hidden) return;
    try {
      if (!buffers.current.has(index)) {
        const samples = createMascotLetter(index, context.sampleRate);
        const buffer = context.createBuffer(1, samples.length, context.sampleRate);
        buffer.copyToChannel(samples, 0);
        buffers.current.set(index, buffer);
      }
      const source = context.createBufferSource();
      source.buffer = buffers.current.get(index);
      source.connect(context.destination);
      sources.current.add(source);
      source.onended = () => { source.disconnect(); sources.current.delete(source); };
      source.start();
    } catch {}
  }, []);
  useEffect(() => () => {
    stop();
    const context = audio.current;
    audio.current = null;
    buffers.current.clear();
    if (context && context.state !== 'closed') context.close().catch(() => {});
  }, [stop]);
  return { unlock, playLetter, stop };
}
