let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playChime(freqs: number[], interval: number, duration: number, type: OscillatorType = 'sine', volume = 0.12) {
  const ctx = getCtx();
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    const start = ctx.currentTime + i * interval;
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  });
}

// Token earned — short ascending ding
export function playTokenEarned() {
  playChime([523, 659], 0.08, 0.2, 'sine', 0.12);
}

// Spin start — quick whoosh
export function playSpinStart() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 200;
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
  gain.gain.value = 0.06;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

// Small/medium win — pleasant chime
export function playWin() {
  playChime([523, 659, 784], 0.1, 0.25, 'sine', 0.12);
}

// Big win — bigger chime
export function playBigWin() {
  playChime([523, 659, 784, 1047], 0.1, 0.3, 'sine', 0.15);
}

// Jackpot — fanfare
export function playJackpot() {
  playChime([523, 659, 784, 1047, 1319], 0.08, 0.35, 'sine', 0.18);
}

// Reward redeemed — success ding
export function playRedeem() {
  playChime([784, 1047], 0.12, 0.2, 'sine', 0.1);
}

// Near miss — soft low tone
export function playNearMiss() {
  playTone(330, 0.3, 'triangle', 0.08);
}
