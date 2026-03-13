function createTitleStars(random = Math.random) {
  return Array.from({ length: 200 }, () => ({
    x: random(),
    y: random(),
    r: random() * 2 + 0.5,
    v: random() * 0.0003 + 0.0001,
    alpha: random() * 0.8 + 0.2,
  }));
}

function createTitleParticles(random = Math.random) {
  return Array.from({ length: 40 }, () => ({
    x: random(),
    y: random(),
    vx: (random() - 0.5) * 0.0005,
    vy: (random() - 0.5) * 0.0005,
    r: random() * 40 + 10,
    alpha: random() * 0.06 + 0.01,
  }));
}

function bindBrowserFn(fn, context) {
  if (typeof fn !== 'function') return null;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

function getViewportSize(win, doc) {
  return {
    width: win?.innerWidth || doc?.documentElement?.clientWidth || 1280,
    height: win?.innerHeight || doc?.documentElement?.clientHeight || 720,
  };
}

export function createTitleCanvasRuntime({
  win = null,
  doc = null,
  setTimeoutFn = null,
  now = Date.now,
  random = Math.random,
} = {}) {
  const requestFrame = bindBrowserFn(win?.requestAnimationFrame, win);
  const cancelFrame = bindBrowserFn(win?.cancelAnimationFrame, win);
  const scheduleTimeout = setTimeoutFn || bindBrowserFn(win?.setTimeout, win) || setTimeout;
  const stars = createTitleStars(random);
  const particles = createTitleParticles(random);
  let canvas = null;
  let ctx = null;
  let raf = 0;
  let resizeBound = false;

  function resize() {
    if (!canvas) return;
    const viewport = getViewportSize(win, doc);
    canvas.width = viewport.width;
    canvas.height = viewport.height;
  }

  function animate() {
    if (!ctx || !canvas) return;
    if (raf) cancelFrame?.(raf);

    const tick = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        raf = requestFrame?.(tick) || 0;
        return;
      }

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -0.2) p.x = 1.2;
        if (p.x > 1.2) p.x = -0.2;
        if (p.y < -0.2) p.y = 1.2;
        if (p.y > 1.2) p.y = -0.2;

        const pX = p.x * w;
        const pY = p.y * h;
        const pR = p.r * (w / 1200);

        const gradient = ctx.createRadialGradient(pX, pY, 0, pX, pY, pR);
        gradient.addColorStop(0, `rgba(123,47,255,${p.alpha})`);
        gradient.addColorStop(0.5, `rgba(0,255,204,${p.alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pX, pY, pR, 0, Math.PI * 2);
        ctx.fill();
      });

      stars.forEach((s) => {
        s.y -= s.v;
        if (s.y < -0.05) s.y = 1.05;

        ctx.save();
        ctx.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin(now() * 0.0015 + s.x * 20));
        ctx.fillStyle = '#f0f4ff';
        ctx.beginPath();
        const size = s.r * (w / 1600);
        ctx.arc(s.x * w, s.y * h, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.globalCompositeOperation = 'source-over';
      raf = requestFrame?.(tick) || 0;
    };

    tick();
  }

  function stop() {
    if (raf) cancelFrame?.(raf);
    raf = 0;
  }

  function init(nextCanvas) {
    canvas = nextCanvas;
    if (!canvas) return;
    ctx = canvas.getContext('2d', { alpha: true });

    resize();
    if (!resizeBound) {
      win?.addEventListener?.('resize', resize);
      resizeBound = true;
    }

    let retry = 0;
    const checkSize = () => {
      if (canvas && (canvas.width < 100 || canvas.height < 100) && retry < 5) {
        resize();
        retry += 1;
        scheduleTimeout(checkSize, 200);
      } else {
        animate();
      }
    };

    checkSize();
  }

  return {
    animate,
    init,
    resize,
    stop,
  };
}
