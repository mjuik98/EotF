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
  _titleCanvas.width = window.innerWidth || document.documentElement.clientWidth || 1280;
  _titleCanvas.height = window.innerHeight || document.documentElement.clientHeight || 720;
}

export const TitleCanvasUI = {
  init(deps = {}) {
    const doc = _getDoc(deps);
    _titleCanvas = doc.getElementById('titleCanvas');
    if (!_titleCanvas) return;
    _titleCtx = _titleCanvas.getContext('2d', { alpha: true });

    this.resize();
    if (!_resizeBound) {
      window.addEventListener('resize', () => {
        this.resize();
      });
      _resizeBound = true;
    }

    // 초기 크기 설정이 실패할 경우를 대비해 반복 시도
    let retry = 0;
    const checkSize = () => {
      if (_titleCanvas && (_titleCanvas.width < 100 || _titleCanvas.height < 100) && retry < 5) {
        this.resize();
        retry++;
        setTimeout(checkSize, 200);
      } else {
        this.animate();
      }
    };
    checkSize();
  },

  resize() {
    _resize();
  },

  animate() {
    if (!_titleCtx || !_titleCanvas) return;
    if (_titleRAF) window.cancelAnimationFrame(_titleRAF);

    const tick = () => {
      const w = _titleCanvas.width;
      const h = _titleCanvas.height;
      if (w === 0 || h === 0) {
        _titleRAF = window.requestAnimationFrame(tick);
        return;
      }

      // 배경을 완전히 덮지 않고 잔상 효과만 주기 위해 clearRect 대신 투명도 있는 fill 사용
      // CSS 배경이 보이도록 alpha 조절
      _titleCtx.globalCompositeOperation = 'destination-out';
      _titleCtx.fillStyle = 'rgba(0,0,0,0.15)';
      _titleCtx.fillRect(0, 0, w, h);
      _titleCtx.globalCompositeOperation = 'lighter'; // 입자들이 겹칠 때 빛나게 함

      _titleParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -0.2) p.x = 1.2;
        if (p.x > 1.2) p.x = -0.2;
        if (p.y < -0.2) p.y = 1.2;
        if (p.y > 1.2) p.y = -0.2;

        const pX = p.x * w;
        const pY = p.y * h;
        const pR = p.r * (w / 1200);

        const g = _titleCtx.createRadialGradient(pX, pY, 0, pX, pY, pR);
        g.addColorStop(0, `rgba(123,47,255,${p.alpha})`);
        g.addColorStop(0.5, `rgba(0,255,204,${p.alpha * 0.4})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');

        _titleCtx.fillStyle = g;
        _titleCtx.beginPath();
        _titleCtx.arc(pX, pY, pR, 0, Math.PI * 2);
        _titleCtx.fill();
      });

      _titleStars.forEach(s => {
        s.y -= s.v;
        if (s.y < -0.05) s.y = 1.05;

        _titleCtx.save();
        _titleCtx.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin(Date.now() * 0.0015 + s.x * 20));
        _titleCtx.fillStyle = '#f0f4ff';
        _titleCtx.beginPath();
        const sSize = s.r * (w / 1600);
        _titleCtx.arc(s.x * w, s.y * h, Math.max(0.5, sSize), 0, Math.PI * 2);
        _titleCtx.fill();
        _titleCtx.restore();
      });

      _titleCtx.globalCompositeOperation = 'source-over';
      _titleRAF = window.requestAnimationFrame(tick);
    };

    tick();
  },

  stop() {
    if (_titleRAF) window.cancelAnimationFrame(_titleRAF);
    _titleRAF = 0;
  },
};

