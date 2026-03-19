function bindBrowserFn(fn, context) {
  if (typeof fn !== 'function') return null;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

export function createCharacterParticleRuntimeFactory({ Particle, getParticleCount }, options = {}) {
  const doc = options.doc || options.win?.document || null;
  const view = options.win || doc?.defaultView || null;
  const requestAnimationFrameImpl = options.requestAnimationFrameImpl || bindBrowserFn(view?.requestAnimationFrame, view);
  const cancelAnimationFrameImpl = options.cancelAnimationFrameImpl || bindBrowserFn(view?.cancelAnimationFrame, view);
  let particles = [];
  let particleRaf = null;

  function start(type, accent) {
    cancelAnimationFrameImpl?.(particleRaf);
    const canvas = doc.getElementById('particleCanvas');
    if (!canvas) return;

    const width = Math.max(1, Math.floor(canvas.clientWidth || canvas.width));
    const height = Math.max(1, Math.floor(canvas.clientHeight || canvas.height));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    particles = Array.from(
      { length: getParticleCount(type) },
      () => new Particle(type, accent, width, height),
    );

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = (type === 'rage' || type === 'aegis') ? 'lighter' : 'source-over';
      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });
      ctx.globalCompositeOperation = 'source-over';
      particleRaf = requestAnimationFrameImpl?.(loop) ?? null;
    };

    loop();
  }

  function stop() {
    cancelAnimationFrameImpl?.(particleRaf);
    particleRaf = null;
    particles = [];
  }

  return {
    start,
    stop,
  };
}
