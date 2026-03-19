import {
  drawEchoRippleParticles,
  drawEchoRippleWaves,
} from './echo_ripple_renderer.js';
import {
  getEchoRippleCaf,
  getEchoRippleDoc,
  getEchoRippleRaf,
  getEchoRippleWin,
  resizeEchoRippleCanvas,
} from './echo_ripple_runtime_context.js';
import {
  spawnEchoRippleBurst,
  spawnEchoRippleScatter,
} from './echo_ripple_particles.js';

let _activeToken = 0;
let _rafId = null;
let _canvas = null;
let _ctx = null;
let _blackOutEl = null;
let _resizeHandler = null;

function _cleanup(caf, win) {
  if (_rafId !== null && typeof caf === 'function') {
    caf(_rafId);
  }
  _rafId = null;

  if (_resizeHandler && win && typeof win.removeEventListener === 'function') {
    win.removeEventListener('resize', _resizeHandler);
  }
  _resizeHandler = null;

  _canvas?.remove();
  _canvas = null;
  _ctx = null;

  _blackOutEl?.remove();
  _blackOutEl = null;
}

export function startEchoRippleDissolve(overlayEl, deps = {}) {
  const doc = getEchoRippleDoc(deps);
  const win = getEchoRippleWin(deps);
  const raf = getEchoRippleRaf(deps, win);
  const caf = getEchoRippleCaf(deps, win);

  if (!overlayEl || !doc?.body || !win || !raf || !caf) {
    overlayEl?.remove?.();
    deps.onComplete?.();
    return;
  }

  _activeToken += 1;
  const token = _activeToken;
  _cleanup(caf, win);

  _canvas = doc.createElement('canvas');
  _canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2005;';
  resizeEchoRippleCanvas(_canvas, win);
  doc.body.appendChild(_canvas);
  _ctx = _canvas.getContext('2d');

  if (!_ctx) {
    _cleanup(caf, win);
    overlayEl.remove();
    deps.onComplete?.();
    return;
  }

  _resizeHandler = () => resizeEchoRippleCanvas(_canvas, win);
  win.addEventListener('resize', _resizeHandler, { passive: true });

  const nowFn = () => (win.performance && typeof win.performance.now === 'function'
    ? win.performance.now()
    : Date.now());
  const startTime = nowFn();

  let overlayAlpha = 1;
  let blackOutStarted = false;
  let scatterSpawned = false;
  let dissolveComplete = false;
  const burstsSpawned = new Set();
  let burstParticles = [];
  let scatterParticles = [];

  function draw(now) {
    if (token !== _activeToken || !_ctx || !_canvas) return;

    const elapsedRaw = (Number.isFinite(now) ? now : nowFn()) - startTime;
    const elapsed = Number.isFinite(elapsedRaw) ? Math.max(0, elapsedRaw) : 0;
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    const cx = _canvas.width / 2;
    const cy = _canvas.height / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy) * 1.1;

    const fadeStart = 280;
    const fadeEnd = 720;
    if (elapsed > fadeStart) {
      overlayAlpha = Math.max(0, 1 - (elapsed - fadeStart) / (fadeEnd - fadeStart));
      overlayEl.style.opacity = String(overlayAlpha);
    }

    if (elapsed > 200 && !scatterSpawned) {
      spawnEchoRippleScatter(scatterParticles, cx, cy);
      scatterSpawned = true;
    }

    if (overlayAlpha < 0.35 && !blackOutStarted) {
      blackOutStarted = true;
      _blackOutEl = doc.createElement('div');
      _blackOutEl.style.cssText = [
        'position:fixed',
        'inset:0',
        'background:#000',
        'opacity:0',
        'z-index:2001',
        'pointer-events:none',
        'transition:opacity 0.55s ease',
      ].join(';');
      doc.body.appendChild(_blackOutEl);
      raf(() => raf(() => {
        if (token === _activeToken && _blackOutEl) _blackOutEl.style.opacity = '1';
      }));
    }

    drawEchoRippleWaves(_ctx, cx, cy, maxR, elapsed, burstsSpawned, (radius, color) => {
      spawnEchoRippleBurst(burstParticles, cx, cy, radius, color);
    });

    burstParticles = burstParticles.filter((p) => p.life > 0);
    burstParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= p.decay;

    });
    drawEchoRippleParticles(_ctx, burstParticles, 0.85, true);

    scatterParticles = scatterParticles.filter((p) => p.life > 0);
    scatterParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.99;
      p.life -= p.decay;
    });
    drawEchoRippleParticles(_ctx, scatterParticles);

    if (elapsed > 980 && !dissolveComplete) {
      dissolveComplete = true;
      overlayEl.remove();
      _cleanup(caf, win);
      deps.onComplete?.();
      return;
    }

    _rafId = raf(draw);
  }

  _rafId = raf(draw);
}
