function _getDoc(deps = {}) {
  if (deps?.doc) return deps.doc;
  if (typeof document === 'undefined') return null;
  return document;
}

function _getWin(deps = {}) {
  if (deps?.win) return deps.win;
  if (typeof window === 'undefined') return null;
  return window;
}

function _getRaf(deps = {}, win = null) {
  if (typeof deps?.requestAnimationFrame === 'function') return deps.requestAnimationFrame;
  if (win && typeof win.requestAnimationFrame === 'function') {
    return win.requestAnimationFrame.bind(win);
  }
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame.bind(globalThis);
  return null;
}

function _getCaf(deps = {}, win = null) {
  if (typeof deps?.cancelAnimationFrame === 'function') return deps.cancelAnimationFrame;
  if (win && typeof win.cancelAnimationFrame === 'function') {
    return win.cancelAnimationFrame.bind(win);
  }
  if (typeof cancelAnimationFrame === 'function') return cancelAnimationFrame.bind(globalThis);
  return null;
}

const WAVES = [
  { delay: 0, speed: 1.0, alpha: 0.55, width: 18, color: [168, 85, 247] },
  { delay: 120, speed: 0.85, alpha: 0.38, width: 12, color: [123, 47, 255] },
  { delay: 240, speed: 0.7, alpha: 0.25, width: 8, color: [80, 20, 200] },
  { delay: 380, speed: 1.2, alpha: 0.18, width: 6, color: [200, 150, 255] },
];
const WAVE_DURATION_MS = 620;

let _activeToken = 0;
let _rafId = null;
let _canvas = null;
let _ctx = null;
let _blackOutEl = null;
let _resizeHandler = null;

function _spawnBurst(particles, cx, cy, waveR, color) {
  const count = 22;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
    const speed = 1.8 + Math.random() * 3.5;
    particles.push({
      x: cx + Math.cos(angle) * waveR,
      y: cy + Math.sin(angle) * waveR,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: 0.025 + Math.random() * 0.03,
      r: 1.5 + Math.random() * 2.5,
      color,
    });
  }
}

function _spawnScatter(particles, cx, cy) {
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: cx + (Math.random() - 0.5) * 520,
      y: cy + (Math.random() - 0.5) * 220,
      vx: Math.cos(angle) * (0.3 + Math.random() * 1.2),
      vy: Math.sin(angle) * (0.3 + Math.random() * 1.2) - 0.4,
      life: 0.7 + Math.random() * 0.3,
      decay: 0.012 + Math.random() * 0.018,
      r: 0.8 + Math.random() * 1.8,
      color: [
        168 + ((Math.random() * 40) | 0),
        85 + ((Math.random() * 30) | 0),
        200 + ((Math.random() * 55) | 0),
      ],
    });
  }
}

function _resizeCanvas(canvas, win) {
  if (!canvas || !win) return;
  canvas.width = win.innerWidth;
  canvas.height = win.innerHeight;
}

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
  const doc = _getDoc(deps);
  const win = _getWin(deps);
  const raf = _getRaf(deps, win);
  const caf = _getCaf(deps, win);

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
  _resizeCanvas(_canvas, win);
  doc.body.appendChild(_canvas);
  _ctx = _canvas.getContext('2d');

  if (!_ctx) {
    _cleanup(caf, win);
    overlayEl.remove();
    deps.onComplete?.();
    return;
  }

  _resizeHandler = () => _resizeCanvas(_canvas, win);
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
      _spawnScatter(scatterParticles, cx, cy);
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

    WAVES.forEach((wave, waveIndex) => {
      const t = elapsed - wave.delay;
      if (t < 0) return;

      const progress = Math.min(1, t / WAVE_DURATION_MS);
      const eased = 1 - Math.pow(1 - progress, 2.5);
      const radius = eased * maxR * wave.speed;
      const falloff = Math.max(0, 1 - progress * 1.1);
      const lineWidth = wave.width * falloff + 2;
      const alpha = wave.alpha * falloff;
      if (alpha < 0.005) return;

      const [r0, g0, b0] = wave.color;
      const gradient = _ctx.createRadialGradient(
        cx,
        cy,
        Math.max(0, radius - lineWidth * 1.5),
        cx,
        cy,
        radius + lineWidth * 0.5,
      );
      gradient.addColorStop(0, `rgba(${r0},${g0},${b0},0)`);
      gradient.addColorStop(0.4, `rgba(${r0},${g0},${b0},${alpha * 0.5})`);
      gradient.addColorStop(0.75, `rgba(${r0},${g0},${b0},${alpha})`);
      gradient.addColorStop(1, `rgba(${r0},${g0},${b0},0)`);

      _ctx.beginPath();
      _ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      _ctx.strokeStyle = gradient;
      _ctx.lineWidth = lineWidth;
      _ctx.stroke();

      if (waveIndex === 0 && progress < 0.6) {
        const innerGlow = _ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        innerGlow.addColorStop(0, 'rgba(123,47,255,0)');
        innerGlow.addColorStop(0.6, 'rgba(123,47,255,0)');
        innerGlow.addColorStop(0.88, `rgba(168,85,247,${0.12 * falloff})`);
        innerGlow.addColorStop(1, 'rgba(168,85,247,0)');
        _ctx.beginPath();
        _ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        _ctx.fillStyle = innerGlow;
        _ctx.fill();
      }

      const burstR = maxR * 0.22 * (waveIndex + 1);
      if (waveIndex < 2 && radius > burstR && !burstsSpawned.has(waveIndex)) {
        _spawnBurst(burstParticles, cx, cy, radius, wave.color);
        burstsSpawned.add(waveIndex);
      }
    });

    burstParticles = burstParticles.filter((p) => p.life > 0);
    burstParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= p.decay;

      const [r, g, b] = p.color;
      const radius = Math.max(0, p.r * p.life);
      if (radius <= 0) return;

      _ctx.beginPath();
      _ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      _ctx.fillStyle = `rgba(${r},${g},${b},${p.life * 0.85})`;
      _ctx.fill();
    });

    scatterParticles = scatterParticles.filter((p) => p.life > 0);
    scatterParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.99;
      p.life -= p.decay;
      const [r, g, b] = p.color;
      _ctx.beginPath();
      _ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      _ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, p.life * 0.7)})`;
      _ctx.fill();
    });

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
