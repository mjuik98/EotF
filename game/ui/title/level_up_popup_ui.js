function drawStar4(ctx, cx, cy, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export class LevelUpPopupUI {
  constructor() {
    this.onClose = null;
    this._raf = null;
    this._particles = [];

    this._buildDom();
    this._bindEvents();
  }

  _buildDom() {
    const wrap = document.createElement('div');
    wrap.id = 'classLevelUpWrap';
    wrap.innerHTML = `
      <div id="classLvupBlur"></div>
      <canvas id="classLvupParticleCanvas"></canvas>
      <div id="classLvupToast" class="class-lvup-toast" style="display:none;">
        <div id="classLvupEyebrow" class="class-lvup-eyebrow"></div>
        <div id="classLvupNum" class="class-lvup-num"></div>
        <div id="classLvupBonus" class="class-lvup-bonus"></div>
        <div class="class-lvup-dismiss">Click or press ESC to close</div>
      </div>
    `;

    document.body.appendChild(wrap);
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
    document.addEventListener('keydown', this._onKeyDown);

    this._onResize = () => {
      if (this._els.canvas?.style.display === 'none') return;
      this._resizeCanvas();
    };
    window.addEventListener('resize', this._onResize);
  }

  _resizeCanvas() {
    const canvas = this._els.canvas;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  show({ classTitle, newLevel, bonusText, accent }) {
    const safeAccent = accent || '#8b6dff';
    this._els.eyebrow.textContent = `${classTitle || 'CLASS'} - LEVEL UP`;
    this._els.eyebrow.style.color = safeAccent;
    this._els.num.textContent = `Lv.${Math.max(1, Number(newLevel) || 1)}`;
    this._els.num.style.color = safeAccent;
    this._els.num.style.textShadow = `0 0 40px ${safeAccent}88`;
    this._els.bonus.textContent = bonusText || 'A class mastery bonus has been unlocked.';

    this._els.blur.style.display = 'block';
    this._els.toast.style.display = 'flex';
    this._els.toast.style.borderColor = `${safeAccent}66`;
    this._els.canvas.style.display = 'block';
    this._resizeCanvas();
    this._startParticles(safeAccent);
  }

  close() {
    this._els.blur.style.display = 'none';
    this._els.toast.style.display = 'none';
    this._els.canvas.style.display = 'none';
    cancelAnimationFrame(this._raf);
    this._raf = null;
    this._particles = [];
    this.onClose?.();
  }

  _startParticles(accent) {
    const canvas = this._els.canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [r, g, b] = [1, 3, 5].map((idx) => Number.parseInt(accent.slice(idx, idx + 2), 16) || 255);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    this._particles = Array.from({ length: 130 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 130 + (Math.random() - 0.5) * 0.45;
      const speed = Math.random() * 7 + 3;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2.8,
        life: 1,
        decay: 0.011 + Math.random() * 0.014,
        s: Math.random() * 4 + 1,
        star: i < 44,
        t: 0,
      };
    });

    cancelAnimationFrame(this._raf);

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (const p of this._particles) {
        if (p.life <= 0) continue;
        alive = true;

        p.life -= p.decay;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.98;
        p.t += 1;

        const alpha = Math.max(0, Math.min(0.9, p.life));
        if (p.star) {
          const useGold = Math.floor(p.t / 7) % 2 === 0;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.t * 0.08);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = useGold ? 'rgb(255,215,0)' : `rgba(${r},${g},${b},0.9)`;
          drawStar4(ctx, 0, 0, p.s * 1.8, p.s * 0.72);
          ctx.restore();
        } else {
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      if (alive) this._raf = requestAnimationFrame(frame);
      else this._els.canvas.style.display = 'none';
    };

    frame();
  }

  destroy() {
    this.close();
    document.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onResize);
    this._els.wrap?.remove();
  }
}
