'use strict';

(function initTitleCanvasUI(globalObj) {
  let _titleCanvas = null;
  let _titleCtx = null;
  let _titleRAF = 0;
  let _resizeBound = false;

  const _titleStars = Array.from({ length: 200 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 2 + 0.5,
    v: Math.random() * 0.0003 + 0.0001,
    alpha: Math.random() * 0.8 + 0.2,
  }));

  const _titleParticles = Array.from({ length: 40 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0005,
    vy: (Math.random() - 0.5) * 0.0005,
    r: Math.random() * 40 + 10,
    alpha: Math.random() * 0.06 + 0.01,
  }));

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _resize() {
    if (!_titleCanvas) return;
    _titleCanvas.width = globalObj.innerWidth || 1280;
    _titleCanvas.height = globalObj.innerHeight || 720;
  }

  const TitleCanvasUI = {
    init(deps = {}) {
      const doc = _getDoc(deps);
      _titleCanvas = doc.getElementById('titleCanvas');
      if (!_titleCanvas) return;
      _titleCtx = _titleCanvas.getContext('2d');

      this.resize();
      if (!_resizeBound) {
        globalObj.addEventListener('resize', () => this.resize());
        _resizeBound = true;
      }

      if (_titleCanvas.width === 0 || _titleCanvas.height === 0) {
        setTimeout(() => {
          this.resize();
          this.animate();
        }, 100);
      } else {
        this.animate();
      }
    },

    resize() {
      _resize();
    },

    animate() {
      if (!_titleCtx || !_titleCanvas) return;
      if (_titleRAF) globalObj.cancelAnimationFrame(_titleRAF);

      const tick = () => {
        const w = _titleCanvas.width;
        const h = _titleCanvas.height;
        _titleCtx.fillStyle = 'rgba(3,3,10,0.15)';
        _titleCtx.fillRect(0, 0, w, h);

        _titleParticles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -0.1) p.x = 1.1;
          if (p.x > 1.1) p.x = -0.1;
          if (p.y < -0.1) p.y = 1.1;
          if (p.y > 1.1) p.y = -0.1;

          const g = _titleCtx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, p.r * (w / 800));
          g.addColorStop(0, `rgba(123,47,255,${p.alpha})`);
          g.addColorStop(0.5, `rgba(0,255,204,${p.alpha * 0.3})`);
          g.addColorStop(1, 'transparent');
          _titleCtx.fillStyle = g;
          _titleCtx.beginPath();
          _titleCtx.arc(p.x * w, p.y * h, p.r * (w / 800), 0, Math.PI * 2);
          _titleCtx.fill();
        });

        _titleStars.forEach(s => {
          s.y -= s.v;
          if (s.y < -0.01) s.y = 1;
          _titleCtx.save();
          _titleCtx.globalAlpha = s.alpha * (0.5 + 0.5 * Math.sin(Date.now() * 0.001 + s.x * 10));
          _titleCtx.fillStyle = '#eef0ff';
          _titleCtx.beginPath();
          _titleCtx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
          _titleCtx.fill();
          _titleCtx.restore();
        });

        _titleRAF = globalObj.requestAnimationFrame(tick);
      };

      tick();
    },

    stop() {
      if (_titleRAF) globalObj.cancelAnimationFrame(_titleRAF);
      _titleRAF = 0;
    },
  };

  globalObj.TitleCanvasUI = TitleCanvasUI;
})(window);
