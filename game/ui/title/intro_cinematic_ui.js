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

function cleanup(doc = document, win = window, cancelRaf = globalThis.cancelAnimationFrame) {
  runtime.timeoutIds.forEach((id) => clearTimeout(id));
  runtime.timeoutIds = [];

  if (runtime.skipKeyHandler) {
    doc.removeEventListener('keydown', runtime.skipKeyHandler);
    runtime.skipKeyHandler = null;
  }
  if (runtime.resizeHandler) {
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

function startParticleLoop(canvas, win, raf = globalThis.requestAnimationFrame, cancelRaf = globalThis.cancelAnimationFrame) {
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
        particle.x = Math.random() * canvas.width;
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

function revealSequence(sequence) {
  sequence.nodes.forEach((node, index) => {
    const timeoutId = setTimeout(() => {
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

export const IntroCinematicUI = {
  play(deps = {}, onComplete) {
    const doc = deps.doc || document;
    const win = deps.win || window;
    const raf = deps.raf || globalThis.requestAnimationFrame;
    const cancelRaf = deps.cancelRaf || globalThis.cancelAnimationFrame;
    const gs = deps.gs;
    const selectedClass = deps.getSelectedClass?.() || 'swordsman';
    const runCount = gs?.meta?.runCount ?? 1;

    console.log('[IntroCinematicUI] play()', {
      isFirstRun: runCount <= 1,
      runCount,
      selectedClass,
    });

    cleanup(doc, win, cancelRaf);
    ensureIntroStyle(doc);

    const { canvas, overlay, textBox } = buildIntroOverlay(doc);
    runtime.overlay = overlay;
    doc.body.appendChild(overlay);
    startParticleLoop(canvas, win, raf, cancelRaf);

    const sequence = buildIntroSequence(doc, selectedClass, runCount);
    sequence.nodes.forEach((node) => textBox.appendChild(node));

    let skipped = false;
    const finish = () => {
      if (skipped) return;
      skipped = true;
      if (typeof onComplete === 'function') mountRunStartHandoffBlackout(doc);
      cleanup(doc, win, cancelRaf);
      onComplete?.();
    };

    runtime.skipKeyHandler = (event) => {
      if (event.key === 'Escape' || event.key === ' ') finish();
    };
    doc.addEventListener('keydown', runtime.skipKeyHandler);
    overlay.addEventListener('click', finish, { once: true });

    revealSequence(sequence);
    runtime.timeoutIds.push(setTimeout(finish, sequence.totalDuration));
  },
};
