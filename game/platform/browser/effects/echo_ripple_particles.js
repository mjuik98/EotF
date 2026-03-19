export function spawnEchoRippleBurst(particles, cx, cy, waveR, color) {
  const count = 22;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
    const speed = 1.8 + Math.random() * 3.5;
    particles.push({
      x: cx + Math.cos(angle) * waveR,
      y: cy + Math.sin(angle) * waveR,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: 0.025 + Math.random() * 0.03,
      r: 1.5 + Math.random() * 2.5,
      color,
    });
  }
}

export function spawnEchoRippleScatter(particles, cx, cy) {
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: cx + (Math.random() - 0.5) * 520,
      y: cy + (Math.random() - 0.5) * 220,
      vx: Math.cos(angle) * (0.3 + Math.random() * 1.2),
      vy: Math.sin(angle) * (0.3 + Math.random() * 1.2) - 0.4,
      life: 0.7 + Math.random() * 0.3,
      decay: 0.012 + Math.random() * 0.018,
      r: 0.8 + Math.random() * 1.8,
      color: [
        168 + ((Math.random() * 40) | 0),
        85 + ((Math.random() * 30) | 0),
        200 + ((Math.random() * 55) | 0),
      ],
    });
  }
}
