export function drawStar4(ctx, cx, cy, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export function buildLevelUpPopupMarkup() {
  return `
    <div id="classLvupBlur"></div>
    <canvas id="classLvupParticleCanvas"></canvas>
    <div id="classLvupToast" class="class-lvup-toast" style="display:none;">
      <div id="classLvupEyebrow" class="class-lvup-eyebrow"></div>
      <div id="classLvupNum" class="class-lvup-num"></div>
      <div id="classLvupBonus" class="class-lvup-bonus"></div>
      <div class="class-lvup-dismiss">Click or press ESC to close</div>
    </div>
  `;
}

export function normalizeLevelUpPayload(payload = {}) {
  const accent = payload.accent || '#8b6dff';
  const level = Math.max(1, Number(payload.newLevel) || 1);
  return {
    accent,
    bonusText: payload.bonusText || 'A class mastery bonus has been unlocked.',
    eyebrow: `${payload.classTitle || 'CLASS'} - LEVEL UP`,
    levelText: `Lv.${level}`,
  };
}

export function parseAccentRgb(accent) {
  return [1, 3, 5].map((idx) => Number.parseInt(accent.slice(idx, idx + 2), 16) || 255);
}

export function buildLevelUpParticles(accent, width, height, count = 130) {
  const cx = width / 2;
  const cy = height / 2;
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
    const speed = Math.random() * 7 + 3;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2.8,
      life: 1,
      decay: 0.011 + Math.random() * 0.014,
      s: Math.random() * 4 + 1,
      star: i < Math.floor(count * 0.3385),
      t: 0,
      accent,
    };
  });
}

export function resizeFullscreenCanvas(canvas, win) {
  if (!canvas || !win) return;
  canvas.width = win.innerWidth;
  canvas.height = win.innerHeight;
}
