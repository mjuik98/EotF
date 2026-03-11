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
    const t = Date.now() * 0.001;

    ctx.beginPath();
    points.forEach((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = centerY + Math.sin(t * 50 * point.speed + point.phase) * point.amp;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(123,47,255,0)');
    gradient.addColorStop(0.2, 'rgba(123,47,255,0.55)');
    gradient.addColorStop(0.5, 'rgba(0,255,204,0.66)');
    gradient.addColorStop(0.8, 'rgba(123,47,255,0.55)');
    gradient.addColorStop(1, 'rgba(123,47,255,0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();

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
