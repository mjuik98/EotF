export const ECHO_RIPPLE_WAVES = [
  { delay: 0, speed: 1.0, alpha: 0.55, width: 18, color: [168, 85, 247] },
  { delay: 120, speed: 0.85, alpha: 0.38, width: 12, color: [123, 47, 255] },
  { delay: 240, speed: 0.7, alpha: 0.25, width: 8, color: [80, 20, 200] },
  { delay: 380, speed: 1.2, alpha: 0.18, width: 6, color: [200, 150, 255] },
];

export const ECHO_RIPPLE_WAVE_DURATION_MS = 620;

export function drawEchoRippleWaves(ctx, cx, cy, maxR, elapsed, burstsSpawned, onBurst) {
  ECHO_RIPPLE_WAVES.forEach((wave, waveIndex) => {
    const t = elapsed - wave.delay;
    if (t < 0) return;

    const progress = Math.min(1, t / ECHO_RIPPLE_WAVE_DURATION_MS);
    const eased = 1 - Math.pow(1 - progress, 2.5);
    const radius = eased * maxR * wave.speed;
    const falloff = Math.max(0, 1 - progress * 1.1);
    const lineWidth = wave.width * falloff + 2;
    const alpha = wave.alpha * falloff;
    if (alpha < 0.005) return;

    const [r0, g0, b0] = wave.color;
    const gradient = ctx.createRadialGradient(
      cx,
      cy,
      Math.max(0, radius - lineWidth * 1.5),
      cx,
      cy,
      radius + lineWidth * 0.5,
    );
    gradient.addColorStop(0, `rgba(${r0},${g0},${b0},0)`);
    gradient.addColorStop(0.4, `rgba(${r0},${g0},${b0},${alpha * 0.5})`);
    gradient.addColorStop(0.75, `rgba(${r0},${g0},${b0},${alpha})`);
    gradient.addColorStop(1, `rgba(${r0},${g0},${b0},0)`);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    if (waveIndex === 0 && progress < 0.6) {
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      innerGlow.addColorStop(0, 'rgba(123,47,255,0)');
      innerGlow.addColorStop(0.6, 'rgba(123,47,255,0)');
      innerGlow.addColorStop(0.88, `rgba(168,85,247,${0.12 * falloff})`);
      innerGlow.addColorStop(1, 'rgba(168,85,247,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();
    }

    const burstR = maxR * 0.22 * (waveIndex + 1);
    if (waveIndex < 2 && radius > burstR && !burstsSpawned.has(waveIndex)) {
      onBurst(radius, wave.color, waveIndex);
      burstsSpawned.add(waveIndex);
    }
  });
}

export function drawEchoRippleParticles(ctx, particles, alphaMultiplier = 0.7, scaleRadius = false) {
  particles.forEach((p) => {
    const [r, g, b] = p.color;
    const radius = scaleRadius ? Math.max(0, p.r * p.life) : p.r;
    if (radius <= 0) return;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, p.life * alphaMultiplier)})`;
    ctx.fill();
  });
}
