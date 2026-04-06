import {
  buildIntroOverlay,
  buildIntroSequence,
  createIntroParticles,
  ensureIntroStyle,
  mountRunStartHandoffBlackout,
} from './intro_cinematic_helpers.js';
import {
  INPUT_ACTION_CANCEL,
  INPUT_ACTION_CONFIRM,
  keyboardEventMatchesCode,
  isInputActionBoundTo,
} from '../../integration/ui_support_capabilities.js';

const runtime = {
  active: null,
};

function createRuntimeState({ cancelRaf = null, doc = null, timers = null, win = null } = {}) {
  return {
    animationRaf: null,
    cancelRaf,
    doc,
    overlay: null,
    resizeHandler: null,
    skipKeyHandler: null,
    timeoutIds: [],
    timers,
    win,
  };
}

function bindBrowserFn(fn, context) {
  if (typeof fn !== 'function') return null;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

function resolveDoc(deps = {}) {
  if (deps.doc) return deps.doc;
  if (typeof document !== 'undefined') return document;
  return null;
}

function resolveWin(deps = {}, doc = null) {
  if (deps.win) return deps.win;
  if (doc?.defaultView) return doc.defaultView;
  if (typeof window !== 'undefined') return window;
  return null;
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

function isIntroSkipInput(event) {
  return (
    isInputActionBoundTo(event, INPUT_ACTION_CONFIRM)
    || isInputActionBoundTo(event, INPUT_ACTION_CANCEL)
    || keyboardEventMatchesCode(event, 'Space')
  );
}

export function cleanupIntroCinematic(deps = {}) {
  const activeRuntime = runtime.active;
  if (!activeRuntime) return;

  const doc = activeRuntime.doc || resolveDoc(deps);
  const win = activeRuntime.win || resolveWin(deps, doc);
  const timers = activeRuntime.timers || resolveTimerApi(deps, win);
  const cancelRaf = activeRuntime.cancelRaf || resolveCancelRaf(deps, win);

  activeRuntime.timeoutIds.forEach((id) => timers.clearTimeout(id));
  activeRuntime.timeoutIds = [];

  if (doc && activeRuntime.skipKeyHandler) {
    doc.removeEventListener('keydown', activeRuntime.skipKeyHandler);
    activeRuntime.skipKeyHandler = null;
  }
  if (win && activeRuntime.resizeHandler) {
    win.removeEventListener('resize', activeRuntime.resizeHandler);
    activeRuntime.resizeHandler = null;
  }
  if (activeRuntime.animationRaf !== null) {
    cancelRaf?.(activeRuntime.animationRaf);
    activeRuntime.animationRaf = null;
  }
  if (activeRuntime.overlay) {
    activeRuntime.overlay.remove();
    activeRuntime.overlay = null;
  }
  runtime.active = null;
}

function startParticleLoop(activeRuntime, canvas, deps = {}) {
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
  activeRuntime.resizeHandler = resize;
  win.addEventListener('resize', resize);

  const particles = createIntroParticles(canvas.width, canvas.height);
  cancelRaf?.(activeRuntime.animationRaf);

  const draw = () => {
    if (!canvas.isConnected) {
      activeRuntime.animationRaf = null;
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
    activeRuntime.animationRaf = raf?.(draw) ?? null;
  };

  draw();
}

function revealSequence(activeRuntime, sequence, setTimeoutFn = setTimeout) {
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
    activeRuntime.timeoutIds.push(timeoutId);
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

  deps.logger?.info?.('[IntroCinematicUI] play()', {
    isFirstRun: runCount <= 1,
    runCount,
    selectedClass,
  });

  cleanupIntroCinematic();
  ensureIntroStyle(doc);

  const activeRuntime = createRuntimeState({
    cancelRaf,
    doc,
    timers,
    win,
  });
  runtime.active = activeRuntime;

  const { canvas, overlay, textBox } = buildIntroOverlay(doc);
  activeRuntime.overlay = overlay;
  doc.body.appendChild(overlay);
  startParticleLoop(activeRuntime, canvas, {
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

  activeRuntime.skipKeyHandler = (event) => {
    if (!isIntroSkipInput(event)) return;
    event.preventDefault?.();
    finish();
  };
  doc.addEventListener('keydown', activeRuntime.skipKeyHandler);
  overlay.addEventListener('click', finish, { once: true });

  revealSequence(activeRuntime, sequence, timers.setTimeout);
  activeRuntime.timeoutIds.push(timers.setTimeout(finish, sequence.totalDuration));
}
