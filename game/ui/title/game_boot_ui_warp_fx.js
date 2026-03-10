import { getWin } from './game_boot_ui_helpers.js';

export function fireWarpBurst(doc, onDone = () => {}) {
  const canvas = doc.getElementById('titleWarpCanvas');
  if (!canvas) {
    onDone();
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    onDone();
    return;
  }

  const win = getWin();
  const width = canvas.clientWidth || win.innerWidth || 1280;
  const height = canvas.clientHeight || win.innerHeight || 720;
  canvas.width = width;
  canvas.height = height;
  canvas.style.opacity = '1';

  const centerX = width / 2;
  const centerY = height / 2;
  const particles = Array.from({ length: 180 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 14 + 4;
    return {
      x: centerX + (Math.random() - 0.5) * 50,
      y: centerY + (Math.random() - 0.5) * 50,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.9 + 0.1,
      purple: Math.random() < 0.65,
      life: 1,
    };
  });

  let tickCount = 0;
  const tick = () => {
    tickCount += 1;
    ctx.clearRect(0, 0, width, height);
    const progress = Math.min(tickCount / 40, 1);
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach((particle) => {
      const accel = 1 + progress * 3;
      particle.x += particle.vx * accel;
      particle.y += particle.vy * accel;
      particle.life -= 0.024 + progress * 0.04;
      if (particle.life <= 0) return;

      const color = particle.purple
        ? `rgba(123,47,255,${particle.life * particle.alpha})`
        : `rgba(0,255,204,${particle.life * particle.alpha})`;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
    const done = particles.every((particle) => particle.life <= 0) || tickCount >= 70;
    if (!done && typeof win.requestAnimationFrame === 'function') {
      win.requestAnimationFrame(tick);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    canvas.style.opacity = '0';
    onDone();
  };

  if (typeof win.requestAnimationFrame === 'function') {
    win.requestAnimationFrame(tick);
  } else {
    onDone();
  }
}
