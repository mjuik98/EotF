import { hexToRgb } from './event_ui_helpers.js';

const particleSprites = {
  hp: null,
  echo: null,
};

function ensureParticleSprites(doc) {
  if (particleSprites.hp && particleSprites.echo) return;

  const createGradientSprite = (color, size = 64) => {
    const canvas = (doc || document).createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;

    const [r, g, b] = hexToRgb(color);
    const radGlow = ctx.createRadialGradient(center, center, 0, center, center, size / 2);
    radGlow.addColorStop(0, `rgba(${r},${g},${b}, 1)`);
    radGlow.addColorStop(0.3, `rgba(${r},${g},${b}, 0.4)`);
    radGlow.addColorStop(1, `rgba(${r},${g},${b}, 0)`);

    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(center, center, size / 2, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  };

  if (!particleSprites.hp) particleSprites.hp = createGradientSprite('#ff5c96');
  if (!particleSprites.echo) particleSprites.echo = createGradientSprite('#9c63ff');
}

class RestFillParticle {
  constructor(kind, width, height) {
    this.kind = kind === 'echo' ? 'echo' : 'hp';
    this.color = hexToRgb(this.kind === 'echo' ? '#9c63ff' : '#ff5c96');
    this.setBounds(width, height);
    this.reset();
  }

  setBounds(width, height) {
    this.width = Math.max(1, width || 1);
    this.height = Math.max(1, height || 1);
  }

  reset() {
    const isEcho = this.kind === 'echo';
    this.life = 0.62 + Math.random() * 0.38;
    this.decay = 0.004 + Math.random() * 0.0048;
    this.x = this.width * (0.03 + Math.random() * 0.94);
    this.y = this.height * (isEcho ? 0.9 : 0.94) + Math.random() * (isEcho ? 26 : 30);
    this.vx = (Math.random() - 0.5) * (isEcho ? 0.45 : 0.58);
    this.vy = -(Math.random() * (isEcho ? 1.8 : 2.2) + (isEcho ? 1.05 : 1.3));
    this.size = Math.random() * (isEcho ? 2.2 : 2.8) + (isEcho ? 1.1 : 1.3);
    this.phase = Math.random() * Math.PI * 2;
    this.wave = 0.03 + Math.random() * 0.035;
  }

  update(boost = 0) {
    const flow = 1 + boost * 1.35;
    this.life -= this.decay * flow;
    this.phase += this.wave;
    this.x += this.vx * flow + Math.sin(this.phase) * 0.12 * flow;
    this.y += this.vy * flow;

    const outOfBounds = this.y < -20 || this.x < -16 || this.x > this.width + 16;
    if (this.life <= 0 || outOfBounds) this.reset();
  }

  draw(ctx, boost = 0) {
    const alpha = Math.max(0, this.life) * (0.26 + boost * 0.62);
    if (alpha <= 0) return;

    const radius = this.size * (0.9 + boost * 0.65);
    const sprite = particleSprites[this.kind];

    if (sprite) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, alpha * 1.5);
      const drawSize = radius * 4;
      ctx.drawImage(sprite, this.x - drawSize / 2, this.y - drawSize / 2, drawSize, drawSize);
      ctx.restore();
      return;
    }

    const [r, g, b] = this.color;
    ctx.save();
    ctx.globalAlpha = Math.max(0.08, Math.min(1, alpha));
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function resolveRestFillParticleBounds(doc, refs = {}) {
  const target = refs.target
    || doc?.querySelector?.('.game-canvas-wrapper-special')
    || doc?.querySelector?.('#gameCanvas')
    || doc?.querySelector?.('#hudOverlay');
  if (target?.getBoundingClientRect) {
    const rect = target.getBoundingClientRect();
    if (rect.width > 8 && rect.height > 8) {
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
  }

  const win = doc?.defaultView;
  const viewportW = Math.max(1, Math.floor(win?.innerWidth || doc?.documentElement?.clientWidth || 1));
  const viewportH = Math.max(1, Math.floor(win?.innerHeight || doc?.documentElement?.clientHeight || 1));
  return {
    left: 0,
    top: 0,
    width: viewportW,
    height: viewportH,
  };
}

export function startRestFillParticles(overlay, doc) {
  const canvas = overlay?.querySelector('#restFillParticleCanvas');
  if (!canvas) return { setBoost: () => {}, stop: () => {} };

  const ctx = canvas.getContext?.('2d');
  if (!ctx) return { setBoost: () => {}, stop: () => {} };

  const docRef = doc || overlay?.ownerDocument;
  ensureParticleSprites(docRef);
  const win = docRef?.defaultView;
  const refs = {
    target: docRef?.querySelector?.('.game-canvas-wrapper-special')
      || docRef?.querySelector?.('#gameCanvas')
      || docRef?.querySelector?.('#hudOverlay')
      || null,
  };

  let width = 0;
  let height = 0;
  let styleKey = '';
  let hpParticles = [];
  let echoParticles = [];
  let targetHpCount = 0;
  let targetEchoCount = 0;
  let boost = 0.1;
  let rafId = null;
  let resizeQueued = false;
  let settleTimer = null;
  let resizeObserver = null;

  const requestFrame = (cb) => {
    if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(cb);
    return setTimeout(() => cb(performance.now()), 16);
  };
  const cancelFrame = (id) => {
    if (id === null || id === undefined) return;
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(id);
      return;
    }
    clearTimeout(id);
  };

  const syncBounds = (force = false) => {
    const bounds = resolveRestFillParticleBounds(docRef, refs);
    const styleToken = `${Math.round(bounds.left)}:${Math.round(bounds.top)}:${Math.round(bounds.width)}:${Math.round(bounds.height)}`;
    if (force || styleToken !== styleKey) {
      styleKey = styleToken;
      canvas.style.left = `${Math.round(bounds.left)}px`;
      canvas.style.top = `${Math.round(bounds.top)}px`;
      canvas.style.width = `${Math.round(bounds.width)}px`;
      canvas.style.height = `${Math.round(bounds.height)}px`;
    }

    const nextW = Math.max(1, Math.floor(bounds.width || canvas.clientWidth || canvas.width || 1));
    const nextH = Math.max(1, Math.floor(bounds.height || canvas.clientHeight || canvas.height || 1));
    if (!force && nextW === width && nextH === height) return false;

    width = nextW;
    height = nextH;
    canvas.width = width;
    canvas.height = height;

    const density = Math.max(0.72, Math.min(1.45, Math.sqrt((width * height) / (1200 * 700))));
    targetHpCount = Math.max(26, Math.round(56 * density));
    targetEchoCount = Math.max(22, Math.round(50 * density));

    if (!hpParticles.length && !echoParticles.length) {
      const initialHp = Math.min(targetHpCount, 18);
      const initialEcho = Math.min(targetEchoCount, 16);
      hpParticles = Array.from({ length: initialHp }, () => new RestFillParticle('hp', width, height));
      echoParticles = Array.from({ length: initialEcho }, () => new RestFillParticle('echo', width, height));
    } else {
      [...hpParticles, ...echoParticles].forEach((particle) => particle.setBounds(width, height));
    }
    return true;
  };

  const scheduleBoundsSync = () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestFrame(() => {
      resizeQueued = false;
      syncBounds();
    });
  };

  const growParticles = () => {
    const hpNeed = Math.max(0, targetHpCount - hpParticles.length);
    const echoNeed = Math.max(0, targetEchoCount - echoParticles.length);
    const hpBatch = Math.min(4, hpNeed);
    const echoBatch = Math.min(4, echoNeed);
    for (let i = 0; i < hpBatch; i += 1) hpParticles.push(new RestFillParticle('hp', width, height));
    for (let i = 0; i < echoBatch; i += 1) echoParticles.push(new RestFillParticle('echo', width, height));
  };

  const render = () => {
    if (!overlay.isConnected) return;
    if (width <= 1 || height <= 1) {
      syncBounds();
      rafId = requestFrame(render);
      return;
    }
    growParticles();
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    hpParticles.forEach((particle) => {
      particle.update(boost);
      particle.draw(ctx, boost);
    });
    echoParticles.forEach((particle) => {
      particle.update(boost * 0.95);
      particle.draw(ctx, boost * 0.95);
    });
    ctx.globalCompositeOperation = 'source-over';
    rafId = requestFrame(render);
  };

  if (win?.addEventListener) {
    win.addEventListener('resize', scheduleBoundsSync, { passive: true });
    win.addEventListener('orientationchange', scheduleBoundsSync, { passive: true });
  }

  if (typeof win?.ResizeObserver === 'function') {
    resizeObserver = new win.ResizeObserver(() => scheduleBoundsSync());
    if (refs.target) resizeObserver.observe(refs.target);
  }

  syncBounds(true);
  settleTimer = setTimeout(() => scheduleBoundsSync(), 120);
  render();

  return {
    setBoost(nextBoost) {
      const value = Number(nextBoost);
      if (!Number.isFinite(value)) return;
      boost = Math.max(0.06, Math.min(1, value));
    },
    stop() {
      if (win?.removeEventListener) {
        win.removeEventListener('resize', scheduleBoundsSync);
        win.removeEventListener('orientationchange', scheduleBoundsSync);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (settleTimer) {
        clearTimeout(settleTimer);
        settleTimer = null;
      }
      cancelFrame(rafId);
      rafId = null;
      ctx.clearRect(0, 0, width, height);
    },
  };
}
