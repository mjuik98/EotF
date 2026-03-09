let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
  }
  return audioCtx;
}

function tone(frequency, duration, type = 'sine', volume = 0.06, delay = 0) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.35, ctx.currentTime + delay + duration * 0.7);
    gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch (_err) {
    // Ignore environments without audio context support.
  }
}

const fallbackSfx = {
  nav: () => {
    tone(360, 0.1, 'triangle', 0.06);
    tone(520, 0.1, 'triangle', 0.05, 0.09);
  },
  hover: () => tone(900, 0.035, 'sine', 0.022),
  select: () => [261, 329, 392, 523, 659, 880].forEach((f, i) => tone(f, 0.8, 'triangle', 0.05, i * 0.065)),
  compare: () => {
    tone(440, 0.1, 'sine', 0.05);
    tone(660, 0.15, 'triangle', 0.05, 0.09);
  },
  echo: () => {
    tone(300, 0.15, 'sine', 0.05);
    tone(600, 0.2, 'triangle', 0.04, 0.12);
    tone(900, 0.15, 'sine', 0.03, 0.25);
  },
};

export function createCharacterSelectSfx(deps = {}) {
  return {
    nav: () => deps.audioEngine?.playClick?.() ?? fallbackSfx.nav(),
    hover: () => fallbackSfx.hover(),
    select: () => fallbackSfx.select(),
    compare: () => fallbackSfx.compare(),
    echo: () => fallbackSfx.echo(),
  };
}
