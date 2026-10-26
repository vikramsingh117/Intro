let pending = null;

// Called directly by the Home click, before loading or navigation can lose the audio gesture.
export function prepareRadioEntrance() {
  if (pending) return;
  const player = new Audio('/audio/cozy-nordic-quiet-spot.m4a');
  player.loop = true;
  player.volume = 0;
  let context, gain, frame;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      context = new AudioContext();
      gain = context.createGain();
      gain.gain.value = 0;
      context.createMediaElementSource(player).connect(gain);
      gain.connect(context.destination);
      player.volume = 1;
      context.resume().catch(() => {});
    }
  } catch { context?.close().catch(() => {}); context = null; gain = null; }
  const started = player.play().then(() => true, () => false);
  pending = {
    player,
    async fadeIn() {
      if (!await started || player.paused) return false;
      if (gain) {
        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.linearRampToValueAtTime(.4, context.currentTime + 11);
      } else {
        const start = performance.now();
        const tick = now => {
          player.volume = .4 * Math.min(1, (now - start) / 11000);
          if (now - start < 11000) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }
      return true;
    },
    normalVolume() {
      cancelAnimationFrame(frame);
      if (gain) { gain.gain.cancelScheduledValues(context.currentTime); gain.gain.setValueAtTime(.4, context.currentTime); context.resume().catch(() => {}); }
      else player.volume = .4;
    },
    dispose() {
      cancelAnimationFrame(frame);
      player.pause(); player.removeAttribute('src'); player.load();
      context?.close().catch(() => {});
    },
  };
}
export function takeRadioEntrance() { const entrance = pending; pending = null; return entrance; }
export function cancelRadioEntrance() { pending?.dispose(); pending = null; }
