import { hexToRgb } from './event_ui_helpers.js';

const particleSprites = {
  hp: null,
  echo: null,
};

export function ensureParticleSprites(doc) {
  if (particleSprites.hp && particleSprites.echo) return;

  const createGradientSprite = (color, size = 64) => {
    const canvas = (doc || document).createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;

    const [r, g, b] = hexToRgb(color);
    const radGlow = ctx.createRadialGradient(center, center, 0, center, center, size / 2);
    radGlow.addColorStop(0, `rgba(${r},${g},${b}, 1)`);
    radGlow.addColorStop(0.3, `rgba(${r},${g},${b}, 0.4)`);
    radGlow.addColorStop(1, `rgba(${r},${g},${b}, 0)`);

    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(center, center, size / 2, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  };

  if (!particleSprites.hp) particleSprites.hp = createGradientSprite('#ff5c96');
  if (!particleSprites.echo) particleSprites.echo = createGradientSprite('#9c63ff');
}

export class RestFillParticle {
  constructor(kind, width, height) {
    this.kind = kind === 'echo' ? 'echo' : 'hp';
    this.color = hexToRgb(this.kind === 'echo' ? '#9c63ff' : '#ff5c96');
    this.setBounds(width, height);
    this.reset();
  }

  setBounds(width, height) {
    this.width = Math.max(1, width || 1);
    this.height = Math.max(1, height || 1);
  }

  reset() {
    const isEcho = this.kind === 'echo';
    this.life = 0.62 + Math.random() * 0.38;
    this.decay = 0.004 + Math.random() * 0.0048;
    this.x = this.width * (0.03 + Math.random() * 0.94);
    this.y = this.height * (isEcho ? 0.9 : 0.94) + Math.random() * (isEcho ? 26 : 30);
    this.vx = (Math.random() - 0.5) * (isEcho ? 0.45 : 0.58);
    this.vy = -(Math.random() * (isEcho ? 1.8 : 2.2) + (isEcho ? 1.05 : 1.3));
    this.size = Math.random() * (isEcho ? 2.2 : 2.8) + (isEcho ? 1.1 : 1.3);
    this.phase = Math.random() * Math.PI * 2;
    this.wave = 0.03 + Math.random() * 0.035;
  }

  update(boost = 0) {
    const flow = 1 + boost * 1.35;
    this.life -= this.decay * flow;
    this.phase += this.wave;
    this.x += this.vx * flow + Math.sin(this.phase) * 0.12 * flow;
    this.y += this.vy * flow;

    const outOfBounds = this.y < -20 || this.x < -16 || this.x > this.width + 16;
    if (this.life <= 0 || outOfBounds) this.reset();
  }

  draw(ctx, boost = 0) {
    const alpha = Math.max(0, this.life) * (0.26 + boost * 0.62);
    if (alpha <= 0) return;

    const radius = this.size * (0.9 + boost * 0.65);
    const sprite = particleSprites[this.kind];

    if (sprite) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, alpha * 1.5);
      const drawSize = radius * 4;
      ctx.drawImage(sprite, this.x - drawSize / 2, this.y - drawSize / 2, drawSize, drawSize);
      ctx.restore();
      return;
    }

    const [r, g, b] = this.color;
    ctx.save();
    ctx.globalAlpha = Math.max(0.08, Math.min(1, alpha));
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
