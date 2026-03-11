import { getWin } from './game_boot_ui_helpers.js';

const state = {
  waveRaf: 0,
};

export function startAudioWave(doc, deps = {}) {
  const canvas = doc.getElementById('titleAudioWave');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const centerY = height / 2;
  const points = Array.from({ length: 72 }, () => ({
    amp: Math.random() * 6 + 2,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.016 + 0.009,
  }));
  const win = getWin({ ...deps, doc });

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const time = Date.now() * 0.0015;

    const numBars = 36;
    const barWidth = width / numBars - 2;
    
    // Create base gradient for the bars
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(123, 47, 255, 0)');
    gradient.addColorStop(0.3, 'rgba(123, 47, 255, 0.7)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 204, 0.9)');
    gradient.addColorStop(0.7, 'rgba(123, 47, 255, 0.7)');
    gradient.addColorStop(1, 'rgba(123, 47, 255, 0)');

    ctx.fillStyle = gradient;

    for (let i = 0; i < numBars; i++) {
      const x = i * (width / numBars);
      let totalAmp = 0;

      // Add together a few sine waves for complex organic movement
      totalAmp += Math.sin(i * 0.2 + time * 3) * 6;
      totalAmp += Math.sin(i * 0.5 - time * 2) * 4;
      totalAmp += Math.sin(i * 0.1 + time * 5) * 2;

      // Base height + absolute amplitude
      const barHeight = Math.max(4, Math.abs(totalAmp) * 1.5 + 4);

      ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
    }

    if (typeof win?.requestAnimationFrame === 'function') {
      state.waveRaf = win.requestAnimationFrame(draw);
    }
  };

  draw();
}

export function stopAudioWave(deps = {}) {
  const win = getWin(deps);
  if (state.waveRaf && typeof win?.cancelAnimationFrame === 'function') {
    win.cancelAnimationFrame(state.waveRaf);
  }
  state.waveRaf = 0;
}
