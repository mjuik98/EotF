import { cafOf, rafOf, winOf } from './ending_screen_helpers.js';
import {
  buildEndingOrbField,
  buildEndingStarField,
  createEndingWisp,
  createBurstEndingWisp,
} from './ending_screen_fx_model.js';
import {
  bindEndingFxMouse,
  bindEndingFxViewport,
  mountEndingFxRunes,
  startEndingFxSpawner,
} from './ending_screen_fx_runtime.js';

export function initEndingFx(doc, deps, session) {
  const cvA = doc.getElementById('endingCvA');
  const cvS = doc.getElementById('endingCvS');
  const cvW = doc.getElementById('endingCvW');
  const cvT = doc.getElementById('endingCvT');
  const xA = cvA?.getContext?.('2d');
  const xS = cvS?.getContext?.('2d');
  const xW = cvW?.getContext?.('2d');
  if (!xA || !xS || !xW) return { wisps: [] };

  const w = winOf(deps);
  const raf = rafOf(deps);
  const caf = cafOf(deps);
  const wisps = [];
  const orb = buildEndingOrbField();
  const stars = buildEndingStarField();

  bindEndingFxViewport(w, [cvA, cvS, cvW, cvT], session);
  const mouse = bindEndingFxMouse(doc, w, session);
  mountEndingFxRunes(doc);
  startEndingFxSpawner(w, wisps, session, createEndingWisp);

  let id = 0;
  const loop = (ts) => {
    xA.clearRect(0, 0, cvA.width, cvA.height);
    xS.clearRect(0, 0, cvS.width, cvS.height);
    xW.clearRect(0, 0, cvW.width, cvW.height);

    orb.forEach((entry) => {
      const px = (entry.x + (Math.sin(ts * entry.s + entry.p) * 0.13)) * cvA.width;
      const py = (entry.y + (Math.cos(ts * entry.s * 0.7 + entry.p) * 0.11)) * cvA.height;
      const r = entry.r * Math.min(cvA.width, cvA.height);
      const alpha = 0.05 + (Math.sin(ts * 0.00046 + entry.p) * 0.018);
      const gradient = xA.createRadialGradient(px, py, 0, px, py, r);
      gradient.addColorStop(0, `${entry.h}${alpha + 0.025})`);
      gradient.addColorStop(0.5, `${entry.h}${alpha * 0.35})`);
      gradient.addColorStop(1, `${entry.h}0)`);
      xA.fillStyle = gradient;
      xA.beginPath();
      xA.ellipse(px, py, r, r * 0.62, (ts * 0.00005) + (entry.p * 0.28), 0, Math.PI * 2);
      xA.fill();
    });

    stars.forEach((star) => {
      const alpha = star.b * (0.42 + (0.58 * Math.sin(ts * star.t + star.p)));
      const sx = star.x * cvS.width;
      const sy = star.y * cvS.height;
      star.n.forEach((index) => {
        const target = stars[index];
        if (!target) return;
        const lineAlpha = Math.max(0, (1 - (Math.hypot((star.x - target.x) * cvS.width, (star.y - target.y) * cvS.height) / 90)) * 0.07 * alpha);
        xS.strokeStyle = `rgba(155,127,232,${lineAlpha})`;
        xS.lineWidth = 0.4;
        xS.beginPath();
        xS.moveTo(sx, sy);
        xS.lineTo(target.x * cvS.width, target.y * cvS.height);
        xS.stroke();
      });
      if (star.z > 1) {
        const gradient = xS.createRadialGradient(sx, sy, 0, sx, sy, star.z * 3.5);
        gradient.addColorStop(0, `rgba(210,195,255,${alpha * 0.35})`);
        gradient.addColorStop(1, 'rgba(210,195,255,0)');
        xS.fillStyle = gradient;
        xS.beginPath();
        xS.arc(sx, sy, star.z * 3.5, 0, Math.PI * 2);
        xS.fill();
      }
      xS.globalAlpha = alpha;
      xS.fillStyle = '#ece8ff';
      xS.beginPath();
      xS.arc(sx, sy, star.z, 0, Math.PI * 2);
      xS.fill();
    });
    xS.globalAlpha = 1;

    for (let i = wisps.length - 1; i >= 0; i -= 1) {
      const wisp = wisps[i];
      wisp.x += wisp.vx / 60;
      wisp.y += wisp.vy / 60;
      wisp.vy += wisp.a ? 0 : (110 / 60);
      wisp.life -= 1 / 60;
      if (wisp.life <= 0) {
        wisps.splice(i, 1);
        continue;
      }
      const ratio = wisp.life / wisp.ml;
      const alpha = wisp.a ? Math.sin(ratio * Math.PI) * 0.35 : Math.pow(ratio, 1.6) * 0.88;
      const gradient = xW.createRadialGradient(wisp.x, wisp.y, 0, wisp.x, wisp.y, wisp.sz * 5.5);
      gradient.addColorStop(0, `${wisp.c}${alpha * 0.65})`);
      gradient.addColorStop(1, `${wisp.c}0)`);
      xW.fillStyle = gradient;
      xW.beginPath();
      xW.arc(wisp.x, wisp.y, wisp.sz * 5.5, 0, Math.PI * 2);
      xW.fill();
      xW.globalAlpha = alpha;
      xW.fillStyle = `${wisp.c}1)`;
      xW.beginPath();
      xW.arc(wisp.x, wisp.y, wisp.sz, 0, Math.PI * 2);
      xW.fill();
    }
    xW.globalAlpha = 1;

    const pxLayer = doc.getElementById('pxLayer');
    if (pxLayer) {
      pxLayer.style.transform = `translate(${mouse.px * w.innerWidth * 0.018}px,${mouse.py * w.innerHeight * 0.018}px)`;
    }
    id = raf(loop);
  };

  id = raf(loop);
  session.cleanups.push(() => caf(id));
  return { wisps };
}

export function burstEndingWisps(wisps, x, y, n = 16) {
  for (let i = 0; i < n; i += 1) {
    wisps.push(createBurstEndingWisp(x, y, i, n));
  }
}

export { runEndingScene } from './ending_screen_scene_runtime.js';
