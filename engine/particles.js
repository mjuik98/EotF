const ParticleSystem = (() => {
  const POOL_SIZE = 300;
  const pool = Array.from({ length: POOL_SIZE }, () => ({ active: false }));
  let canvas, ctx;

  function init(c) {
    canvas = c; ctx = c.getContext('2d');
  }

  function spawn(x, y, { count=8, color='#7b2fff', size=3, speed=3, life=0.6, type='dot' } = {}) {
    let spawned = 0;
    for (let p of pool) {
      if (spawned >= count) break;
      if (!p.active) {
        const a = Math.random() * Math.PI * 2;
        const v = speed * (0.5 + Math.random() * 0.5);
        Object.assign(p, {
          active: true, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 1, maxLife: life, color, size: size * (0.5 + Math.random()), type,
          decay: 1 / (life * 60),
        });
        spawned++;
      }
    }
  }

  function hitEffect(x, y, big=false) {
    spawn(x, y, { count: big ? 16 : 8, color: '#ff3366', size: big ? 5 : 3, speed: big ? 6 : 4 });
    spawn(x, y, { count: 4, color: '#ffffff', size: 2, speed: 2, life: 0.3 });
  }

  function burstEffect(x, y) {
    spawn(x, y, { count: 40, color: '#00ffcc', size: 4, speed: 8, life: 1.0 });
    spawn(x, y, { count: 20, color: '#7b2fff', size: 6, speed: 5, life: 0.8 });
  }

  function healEffect(x, y) {
    spawn(x, y, { count: 12, color: '#44ff88', size: 3, speed: 3, life: 0.8, type: 'circle' });
  }

  function deathEffect(x, y) {
    spawn(x, y, { count: 60, color: '#7b2fff', size: 5, speed: 10, life: 1.5 });
    spawn(x, y, { count: 20, color: '#ffffff', size: 2, speed: 4, life: 0.5 });
  }

  function emit(x, y, opts) { spawn(x, y, opts); }

  function update() {
    if (!ctx || !canvas) return;
    for (const p of pool) {
      if (!p.active) continue;
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.1;
      p.vx *= 0.97; p.vy *= 0.97;
      p.life -= p.decay;
      if (p.life <= 0) { p.active = false; continue; }
      const alpha = p.life;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
  }

  return { init, update, hitEffect, burstEffect, healEffect, deathEffect, emit };
})();

// ────────────────────────────────────────
// SCREEN SHAKE + HIT STOP
// ────────────────────────────────────────
