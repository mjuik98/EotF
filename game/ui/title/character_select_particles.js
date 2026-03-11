function hexToRgbChannels(hex) {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)).join(',');
}

class Particle {
  constructor(type, accent, width, height) {
    this.type = type;
    this.accent = accent;
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    const { type, width, height } = this;
    this.life = 0.6 + Math.random() * 0.4;
    this.decay = 0.004 + Math.random() * 0.005;

    if (type === 'ember') {
      this.x = width * 0.2 + Math.random() * width * 0.6;
      this.y = height + 5;
      this.vx = (Math.random() - 0.5) * 1.8;
      this.vy = -(Math.random() * 2.5 + 1);
      this.s = Math.random() * 3 + 1;
      return;
    }

    if (type === 'orb') {
      const maxOrbit = Math.min(width, height);
      this.angle = Math.random() * Math.PI * 2;
      this.r = maxOrbit * (0.18 + Math.random() * 0.32);
      this.speed = (Math.random() * 0.005 + 0.0025) * (Math.random() > 0.5 ? 1 : -1);
      this.s = Math.random() * 3 + 1.2;
      this.x = width / 2 + Math.cos(this.angle) * this.r;
      this.y = height / 2 + Math.sin(this.angle) * this.r;
      return;
    }

    if (type === 'rage') {
      this.x = width * 0.06 + Math.random() * width * 0.88;
      this.y = height * 0.2 + Math.random() * height * 0.72;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = -(Math.random() * 1.8 + 0.6);
      this.s = Math.random() * 3.2 + 1.4;
      this.len = Math.random() * 14 + 8;
      this.rot = (Math.random() - 0.5) * 1.6;
      this.decay = 0.0028 + Math.random() * 0.0038;
      return;
    }

    if (type === 'smoke') {
      this.x = width * 0.12 + Math.random() * width * 0.76;
      this.y = height * 0.55 + Math.random() * height * 0.4;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = -(Math.random() * 0.7 + 0.15);
      this.s = Math.random() * 8 + 6;
      this.decay = 0.0025 + Math.random() * 0.0035;
      return;
    }

    if (type === 'aegis') {
      const maxOrbit = Math.min(width, height);
      this.angle = Math.random() * Math.PI * 2;
      this.r = maxOrbit * (0.18 + Math.random() * 0.44);
      this.speed = (Math.random() * 0.0032 + 0.0012) * (Math.random() > 0.5 ? 1 : -1);
      this.s = Math.random() * 2.8 + 2.4;
      this.pulse = Math.random() * Math.PI * 2;
      this.rot = Math.random() * Math.PI * 2;
      this.decay = 0.0024 + Math.random() * 0.003;
      this.x = width / 2 + Math.cos(this.angle) * this.r;
      this.y = height / 2 + Math.sin(this.angle) * this.r;
      return;
    }

    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.6 + 0.1);
    this.s = Math.random() * 2.5 + 0.5;
    this.pulse = Math.random() * Math.PI * 2;
  }

  update() {
    this.life -= this.decay;

    if (this.type === 'orb') {
      this.angle += this.speed;
      this.x = this.width / 2 + Math.cos(this.angle) * this.r;
      this.y = this.height / 2 + Math.sin(this.angle) * this.r;
    } else if (this.type === 'rage') {
      this.x += this.vx;
      this.y += this.vy;
      this.vx += (Math.random() - 0.5) * 0.03;
      this.vx *= 0.985;
      this.vy += 0.02;
      this.len *= 0.996;
      this.rot += (Math.random() - 0.5) * 0.06;
    } else if (this.type === 'smoke') {
      this.x += this.vx;
      this.y += this.vy;
      this.s += 0.04;
    } else if (this.type === 'aegis') {
      this.angle += this.speed;
      this.pulse += 0.06;
      this.rot += this.speed * 2.2;
      const radius = this.r * (1 + 0.08 * Math.sin(this.pulse));
      this.x = this.width / 2 + Math.cos(this.angle) * radius;
      this.y = this.height / 2 + Math.sin(this.angle) * radius;
    } else if (this.type === 'holy') {
      this.pulse += 0.05;
      this.x += this.vx;
      this.y += this.vy;
    } else {
      this.x += this.vx;
      this.y += this.vy;
    }

    if (this.life <= 0) this.reset();
  }

  draw(ctx) {
    const rgb = hexToRgbChannels(this.accent);
    const alpha = Math.max(0, this.life);
    ctx.save();

    if (this.type === 'smoke') {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.s);
      gradient.addColorStop(0, `rgba(${rgb},${alpha * 0.34})`);
      gradient.addColorStop(0.7, `rgba(${rgb},${alpha * 0.15})`);
      gradient.addColorStop(1, `rgba(${rgb},0)`);
      ctx.shadowBlur = 14;
      ctx.shadowColor = `rgba(${rgb},${alpha * 0.16})`;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'rage') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      const len = Math.max(3, this.len);
      const gradient = ctx.createLinearGradient(-len * 0.5, 0, len * 0.55, 0);
      gradient.addColorStop(0, `rgba(${rgb},0)`);
      gradient.addColorStop(0.45, `rgba(${rgb},${alpha * 0.25})`);
      gradient.addColorStop(1, `rgba(${rgb},${alpha * 0.9})`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.s;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(${rgb},${alpha * 0.82})`;
      ctx.beginPath();
      ctx.moveTo(-len * 0.5, 0);
      ctx.lineTo(len * 0.55, 0);
      ctx.stroke();

      const cross = ctx.createLinearGradient(-len * 0.22, this.s * 0.35, len * 0.35, -this.s * 0.28);
      cross.addColorStop(0, `rgba(${rgb},0)`);
      cross.addColorStop(1, `rgba(${rgb},${alpha * 0.6})`);
      ctx.strokeStyle = cross;
      ctx.lineWidth = Math.max(0.9, this.s * 0.45);
      ctx.beginPath();
      ctx.moveTo(-len * 0.22, this.s * 0.35);
      ctx.lineTo(len * 0.35, -this.s * 0.28);
      ctx.stroke();

      ctx.fillStyle = `rgba(${rgb},${alpha * 0.88})`;
      ctx.beginPath();
      ctx.arc(len * 0.58, 0, this.s * 0.48, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'aegis') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      const size = this.s * (1 + 0.28 * Math.sin(this.pulse));
      ctx.shadowBlur = 14;
      ctx.shadowColor = `rgba(${rgb},${alpha * 0.55})`;
      ctx.fillStyle = `rgba(${rgb},${alpha * 0.16})`;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.88})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.46})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, size * (1.85 + 0.16 * Math.sin(this.pulse * 1.3)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.26})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.arc(0, 0, size * 2.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.38})`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-size * 1.2, 0);
      ctx.lineTo(size * 1.2, 0);
      ctx.moveTo(0, -size * 1.2);
      ctx.lineTo(0, size * 1.2);
      ctx.stroke();
    } else if (this.type === 'holy') {
      const size = this.s * (1 + 0.3 * Math.sin(this.pulse));
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${rgb},.9)`;
      ctx.fillStyle = `rgba(${rgb},${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(this.x - size * 3, this.y);
      ctx.lineTo(this.x + size * 3, this.y);
      ctx.moveTo(this.x, this.y - size * 3);
      ctx.lineTo(this.x, this.y + size * 3);
      ctx.stroke();
    } else {
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${rgb},.8)`;
      ctx.fillStyle = `rgba(${rgb},${alpha * 0.88})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function getParticleCount(type) {
  if (type === 'rage') return 84;
  if (type === 'aegis') return 52;
  return 40;
}

function bindBrowserFn(fn, context) {
  if (typeof fn !== 'function') return null;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

export function createCharacterParticleRuntime(options = {}) {
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
