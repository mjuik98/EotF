import { resolveRestFillParticleBounds } from './event_ui_particle_bounds.js';
import { ensureParticleSprites, RestFillParticle } from './event_ui_particle_model.js';

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
