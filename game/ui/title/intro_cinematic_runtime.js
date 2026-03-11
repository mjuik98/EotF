import {
  buildIntroOverlay,
  buildIntroSequence,
  createIntroParticles,
  ensureIntroStyle,
  mountRunStartHandoffBlackout,
} from './intro_cinematic_helpers.js';

const runtime = {
  animationRaf: null,
  overlay: null,
  resizeHandler: null,
  skipKeyHandler: null,
  timeoutIds: [],
};

function bindBrowserFn(fn, context) {
  if (typeof fn !== 'function') return null;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

function resolveDoc(deps = {}) {
  return deps.doc || null;
}

function resolveWin(deps = {}, doc = null) {
  return deps.win || doc?.defaultView || null;
}

function resolveTimerApi(deps = {}, win = null) {
  return {
    setTimeout: deps.setTimeoutFn || bindBrowserFn(win?.setTimeout, win) || setTimeout,
    clearTimeout: deps.clearTimeoutFn || bindBrowserFn(win?.clearTimeout, win) || clearTimeout,
  };
}

function resolveRaf(deps = {}, win = null) {
  return deps.raf || bindBrowserFn(win?.requestAnimationFrame, win) || null;
}

function resolveCancelRaf(deps = {}, win = null) {
  return deps.cancelRaf || bindBrowserFn(win?.cancelAnimationFrame, win) || null;
}

export function cleanupIntroCinematic(deps = {}) {
  const doc = resolveDoc(deps);
  const win = resolveWin(deps, doc);
  const timers = resolveTimerApi(deps, win);
  const cancelRaf = resolveCancelRaf(deps, win);

  runtime.timeoutIds.forEach((id) => timers.clearTimeout(id));
  runtime.timeoutIds = [];

  if (doc && runtime.skipKeyHandler) {
    doc.removeEventListener('keydown', runtime.skipKeyHandler);
    runtime.skipKeyHandler = null;
  }
  if (win && runtime.resizeHandler) {
    win.removeEventListener('resize', runtime.resizeHandler);
    runtime.resizeHandler = null;
  }
  if (runtime.animationRaf !== null) {
    cancelRaf?.(runtime.animationRaf);
    runtime.animationRaf = null;
  }
  if (runtime.overlay) {
    runtime.overlay.remove();
    runtime.overlay = null;
  }
}

function startParticleLoop(canvas, deps = {}) {
  const win = resolveWin(deps, canvas?.ownerDocument);
  const raf = resolveRaf(deps, win);
  const cancelRaf = resolveCancelRaf(deps, win);
  const random = deps.random || Math.random;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    canvas.width = canvas.offsetWidth || win.innerWidth;
    canvas.height = canvas.offsetHeight || win.innerHeight;
  };
  resize();
  runtime.resizeHandler = resize;
  win.addEventListener('resize', resize);

  const particles = createIntroParticles(canvas.width, canvas.height);
  cancelRaf?.(runtime.animationRaf);

  const draw = () => {
    if (!canvas.isConnected) {
      runtime.animationRaf = null;
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.y += particle.vy;
      if (particle.y < 0) {
        particle.y = canvas.height;
        particle.x = random() * canvas.width;
      }
      ctx.fillStyle = 'rgba(123,47,255,0.8)';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });
    runtime.animationRaf = raf?.(draw) ?? null;
  };

  draw();
}

function revealSequence(sequence, setTimeoutFn = setTimeout) {
  sequence.nodes.forEach((node, index) => {
    const timeoutId = setTimeoutFn(() => {
      const el = sequence.nodes[index];
      if (!el?.isConnected) return;
      if (el.dataset.kind === 'divider') {
        el.style.height = '40px';
        el.style.opacity = '1';
        return;
      }
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, sequence.delays[index]);
    runtime.timeoutIds.push(timeoutId);
  });
}

export function playIntroCinematicRuntime(deps = {}, onComplete) {
  const doc = resolveDoc(deps);
  const win = resolveWin(deps, doc);
  const timers = resolveTimerApi(deps, win);
  const raf = resolveRaf(deps, win);
  const cancelRaf = resolveCancelRaf(deps, win);
  const gs = deps.gs;
  const selectedClass = deps.getSelectedClass?.() || 'swordsman';
  const runCount = gs?.meta?.runCount ?? 1;

  console.log('[IntroCinematicUI] play()', {
    isFirstRun: runCount <= 1,
    runCount,
    selectedClass,
  });

  cleanupIntroCinematic({
    doc,
    win,
    cancelRaf,
    clearTimeoutFn: timers.clearTimeout,
  });
  ensureIntroStyle(doc);

  const { canvas, overlay, textBox } = buildIntroOverlay(doc);
  runtime.overlay = overlay;
  doc.body.appendChild(overlay);
  startParticleLoop(canvas, {
    win,
    raf,
    cancelRaf,
    random: deps.random,
  });

  const sequence = buildIntroSequence(doc, selectedClass, runCount);
  sequence.nodes.forEach((node) => textBox.appendChild(node));

  let skipped = false;
  const finish = () => {
    if (skipped) return;
    skipped = true;
    if (typeof onComplete === 'function') mountRunStartHandoffBlackout(doc);
    cleanupIntroCinematic({
      doc,
      win,
      cancelRaf,
      clearTimeoutFn: timers.clearTimeout,
    });
    onComplete?.();
  };

  runtime.skipKeyHandler = (event) => {
    if (event.key === 'Escape' || event.key === ' ') finish();
  };
  doc.addEventListener('keydown', runtime.skipKeyHandler);
  overlay.addEventListener('click', finish, { once: true });

  revealSequence(sequence, timers.setTimeout);
  runtime.timeoutIds.push(timers.setTimeout(finish, sequence.totalDuration));
}
