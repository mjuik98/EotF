import {
  buildLevelUpParticles,
  buildLevelUpPopupMarkup,
  drawStar4,
  normalizeLevelUpPayload,
  parseAccentRgb,
  resizeFullscreenCanvas,
} from './level_up_popup_helpers.js';

export function initLevelUpPopupRuntime(instance) {
  const wrap = instance._doc.createElement('div');
  wrap.id = 'classLevelUpWrap';
  wrap.innerHTML = buildLevelUpPopupMarkup();
  instance._doc.body.appendChild(wrap);
  instance._els = {
    wrap,
    blur: wrap.querySelector('#classLvupBlur'),
    canvas: wrap.querySelector('#classLvupParticleCanvas'),
    toast: wrap.querySelector('#classLvupToast'),
    eyebrow: wrap.querySelector('#classLvupEyebrow'),
    num: wrap.querySelector('#classLvupNum'),
    bonus: wrap.querySelector('#classLvupBonus'),
  };

  bindLevelUpPopupRuntime(instance);
}

export function bindLevelUpPopupRuntime(instance) {
  const close = () => instance.close();
  instance._els.blur?.addEventListener('click', close);
  instance._els.toast?.addEventListener('click', close);

  instance._onKeyDown = (event) => {
    if (instance._els.toast?.style.display === 'none') return;
    if (event.key === 'Escape' || event.key === ' ') instance.close();
  };
  instance._doc.addEventListener('keydown', instance._onKeyDown);

  instance._onResize = () => {
    if (instance._els.canvas?.style.display === 'none') return;
    resizeLevelUpCanvasRuntime(instance);
  };
  instance._win.addEventListener('resize', instance._onResize);
}

export function resizeLevelUpCanvasRuntime(instance) {
  resizeFullscreenCanvas(instance._els.canvas, instance._win);
}

export function startLevelUpParticlesRuntime(instance, accent) {
  const canvas = instance._els.canvas;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const [r, g, b] = parseAccentRgb(accent);
  instance._particles = buildLevelUpParticles(accent, canvas.width, canvas.height);
  instance._cancelRafImpl?.(instance._raf);

  const frame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const particle of instance._particles) {
      if (particle.life <= 0) continue;
      alive = true;

      particle.life -= particle.decay;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.12;
      particle.vx *= 0.98;
      particle.t += 1;

      const alpha = Math.max(0, Math.min(0.9, particle.life));
      if (particle.star) {
        const useGold = Math.floor(particle.t / 7) % 2 === 0;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.t * 0.08);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = useGold ? 'rgb(255,215,0)' : `rgba(${r},${g},${b},0.9)`;
        drawStar4(ctx, 0, 0, particle.s * 1.8, particle.s * 0.72);
        ctx.restore();
      } else {
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    if (alive) instance._raf = instance._rafImpl?.(frame);
    else instance._els.canvas.style.display = 'none';
  };

  frame();
}

export function showLevelUpPopupRuntime(instance, payload) {
  const normalized = normalizeLevelUpPayload(payload);
  instance._els.eyebrow.textContent = normalized.eyebrow;
  instance._els.eyebrow.style.color = normalized.accent;
  instance._els.num.textContent = normalized.levelText;
  instance._els.num.style.color = normalized.accent;
  instance._els.num.style.textShadow = `0 0 40px ${normalized.accent}88`;
  instance._els.bonus.textContent = normalized.bonusText;

  instance._els.blur.style.display = 'block';
  instance._els.toast.style.display = 'flex';
  instance._els.toast.style.borderColor = `${normalized.accent}66`;
  instance._els.canvas.style.display = 'block';
  resizeLevelUpCanvasRuntime(instance);
  startLevelUpParticlesRuntime(instance, normalized.accent);
}

export function closeLevelUpPopupRuntime(instance) {
  instance._els.blur.style.display = 'none';
  instance._els.toast.style.display = 'none';
  instance._els.canvas.style.display = 'none';
  instance._cancelRafImpl?.(instance._raf);
  instance._raf = null;
  instance._particles = [];
  instance.onClose?.();
}

export function destroyLevelUpPopupRuntime(instance) {
  closeLevelUpPopupRuntime(instance);
  instance._doc.removeEventListener('keydown', instance._onKeyDown);
  instance._win.removeEventListener('resize', instance._onResize);
  instance._els.wrap?.remove();
}
