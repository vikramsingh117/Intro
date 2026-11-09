// A lightweight synthetic alphabet for the first voice prototype.
// Non-ASCII letters, punctuation, digits, and spaces are silent.
export function mascotLetterIndex(character) {
  if (!/^[a-z]$/i.test(character || '')) return -1;
  return character.toUpperCase().charCodeAt(0) - 65;
}

export function createMascotLetter(index, sampleRate) {
  const duration = .055;
  const samples = new Float32Array(Math.ceil(sampleRate * duration));
  const pitch = 245 + (index % 7) * 17;
  const formant = [750, 450, 320, 550, 380][index % 5];
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const envelope = Math.sin(Math.PI * i / (samples.length - 1)) ** 2;
    const phase = 2 * Math.PI * pitch * (t + .05 * t * t / duration);
    let voice = 0;
    for (let harmonic = 1; harmonic <= 8; harmonic++) {
      const weight = Math.exp(-(((harmonic * pitch - formant) / 650) ** 2)) / harmonic;
      voice += Math.sin(phase * harmonic) * weight;
    }
    samples[i] = voice * envelope * .024;
  }
  return samples;
}
