export const ENDING_RUNES = '✦✧✶✷✹✺☽☾⌘⟡✴✵';
export const ENDING_WISP_COLORS = ['rgba(155,127,232,', 'rgba(74,243,204,', 'rgba(232,121,200,', 'rgba(240,208,128,', 'rgba(236,232,255,'];

export function buildEndingOrbField() {
  return [
    { x: 0.15, y: 0.22, r: 0.54, h: 'rgba(85,45,195,', p: 0, s: 0.00027 },
    { x: 0.85, y: 0.18, r: 0.46, h: 'rgba(28,165,148,', p: 1.7, s: 0.00035 },
    { x: 0.48, y: 0.85, r: 0.58, h: 'rgba(148,45,215,', p: 0.85, s: 0.00021 },
    { x: 0.07, y: 0.65, r: 0.40, h: 'rgba(45,88,198,', p: 2.3, s: 0.00031 },
    { x: 0.93, y: 0.56, r: 0.42, h: 'rgba(198,65,138,', p: 3.2, s: 0.00028 },
    { x: 0.38, y: 0.38, r: 0.32, h: 'rgba(75,155,198,', p: 1.1, s: 0.00042 },
  ];
}

export function buildEndingStarField(random = Math.random) {
  const stars = Array.from({ length: 220 }, () => ({
    x: random(),
    y: random(),
    z: 0.25 + (random() * 1.5),
    b: 0.15 + (random() * 0.75),
    t: 0.0003 + (random() * 0.0025),
    p: random() * Math.PI * 2,
    n: [],
  }));

  stars.forEach((star, index) => {
    stars.slice(index + 1).forEach((target, offset) => {
      if (Math.hypot((star.x - target.x) * 1920, (star.y - target.y) * 1080) < 90 && random() < 0.09) {
        star.n.push(index + 1 + offset);
      }
    });
  });

  return stars;
}

export function createEndingWisp(win, random = Math.random) {
  return {
    x: random() * win.innerWidth,
    y: win.innerHeight + 6,
    vx: (random() - 0.5) * 13,
    vy: -(6 + (random() * 22)),
    life: 5 + (random() * 6),
    ml: 11,
    sz: 0.8 + (random() * 2.2),
    c: ENDING_WISP_COLORS[Math.floor(random() * 3)],
    a: true,
  };
}

export function createBurstEndingWisp(x, y, index, total, random = Math.random) {
  const angle = ((index / total) * Math.PI * 2) + (random() * 0.5);
  const speed = 40 + (random() * 125);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: (Math.sin(angle) * speed) - 28,
    life: 0.9 + (random() * 1.1),
    ml: 2,
    sz: 1.2 + (random() * 3),
    c: ENDING_WISP_COLORS[Math.floor(random() * ENDING_WISP_COLORS.length)],
    a: false,
  };
}
