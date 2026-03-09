import {
  buildLevelUpParticles,
  buildLevelUpPopupMarkup,
  drawStar4,
  normalizeLevelUpPayload,
  parseAccentRgb,
  resizeFullscreenCanvas,
} from './level_up_popup_helpers.js';

export class LevelUpPopupUI {
  constructor(deps = {}) {
    this.onClose = null;
    this._doc = deps.doc || document;
    this._win = deps.win || window;
    this._rafImpl = deps.raf || globalThis.requestAnimationFrame;
    this._cancelRafImpl = deps.cancelRaf || globalThis.cancelAnimationFrame;
    this._raf = null;
    this._particles = [];

    this._buildDom();
    this._bindEvents();
  }

  _buildDom() {
    const wrap = this._doc.createElement('div');
    wrap.id = 'classLevelUpWrap';
    wrap.innerHTML = buildLevelUpPopupMarkup();
    this._doc.body.appendChild(wrap);
    this._els = {
      wrap,
      blur: wrap.querySelector('#classLvupBlur'),
      canvas: wrap.querySelector('#classLvupParticleCanvas'),
      toast: wrap.querySelector('#classLvupToast'),
      eyebrow: wrap.querySelector('#classLvupEyebrow'),
      num: wrap.querySelector('#classLvupNum'),
      bonus: wrap.querySelector('#classLvupBonus'),
    };
  }

  _bindEvents() {
    const close = () => this.close();
    this._els.blur?.addEventListener('click', close);
    this._els.toast?.addEventListener('click', close);

    this._onKeyDown = (event) => {
      if (this._els.toast?.style.display === 'none') return;
      if (event.key === 'Escape' || event.key === ' ') this.close();
    };
    this._doc.addEventListener('keydown', this._onKeyDown);

    this._onResize = () => {
      if (this._els.canvas?.style.display === 'none') return;
      this._resizeCanvas();
    };
    this._win.addEventListener('resize', this._onResize);
  }

  _resizeCanvas() {
    resizeFullscreenCanvas(this._els.canvas, this._win);
  }

  show(payload) {
    const normalized = normalizeLevelUpPayload(payload);
    this._els.eyebrow.textContent = normalized.eyebrow;
    this._els.eyebrow.style.color = normalized.accent;
    this._els.num.textContent = normalized.levelText;
    this._els.num.style.color = normalized.accent;
    this._els.num.style.textShadow = `0 0 40px ${normalized.accent}88`;
    this._els.bonus.textContent = normalized.bonusText;

    this._els.blur.style.display = 'block';
    this._els.toast.style.display = 'flex';
    this._els.toast.style.borderColor = `${normalized.accent}66`;
    this._els.canvas.style.display = 'block';
    this._resizeCanvas();
    this._startParticles(normalized.accent);
  }

  close() {
    this._els.blur.style.display = 'none';
    this._els.toast.style.display = 'none';
    this._els.canvas.style.display = 'none';
    this._cancelRafImpl?.(this._raf);
    this._raf = null;
    this._particles = [];
    this.onClose?.();
  }

  _startParticles(accent) {
    const canvas = this._els.canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [r, g, b] = parseAccentRgb(accent);
    this._particles = buildLevelUpParticles(accent, canvas.width, canvas.height);
    this._cancelRafImpl?.(this._raf);

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (const particle of this._particles) {
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
      if (alive) this._raf = this._rafImpl?.(frame);
      else this._els.canvas.style.display = 'none';
    };

    frame();
  }

  destroy() {
    this.close();
    this._doc.removeEventListener('keydown', this._onKeyDown);
    this._win.removeEventListener('resize', this._onResize);
    this._els.wrap?.remove();
  }
}
