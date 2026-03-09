import { cafOf, rafOf, winOf } from './ending_screen_helpers.js';

const RUNES = '✦✧✶✷✹✺☽☾⌘⟡✴✵';
const WCOLORS = ['rgba(155,127,232,', 'rgba(74,243,204,', 'rgba(232,121,200,', 'rgba(240,208,128,', 'rgba(236,232,255,'];

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const fmt = (value) => Math.max(0, Math.floor(num(value, 0))).toLocaleString('ko-KR');

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
  const orb = [
    { x: 0.15, y: 0.22, r: 0.54, h: 'rgba(85,45,195,', p: 0, s: 0.00027 },
    { x: 0.85, y: 0.18, r: 0.46, h: 'rgba(28,165,148,', p: 1.7, s: 0.00035 },
    { x: 0.48, y: 0.85, r: 0.58, h: 'rgba(148,45,215,', p: 0.85, s: 0.00021 },
    { x: 0.07, y: 0.65, r: 0.40, h: 'rgba(45,88,198,', p: 2.3, s: 0.00031 },
    { x: 0.93, y: 0.56, r: 0.42, h: 'rgba(198,65,138,', p: 3.2, s: 0.00028 },
    { x: 0.38, y: 0.38, r: 0.32, h: 'rgba(75,155,198,', p: 1.1, s: 0.00042 },
  ];
  const stars = Array.from({ length: 220 }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: 0.25 + (Math.random() * 1.5),
    b: 0.15 + (Math.random() * 0.75),
    t: 0.0003 + (Math.random() * 0.0025),
    p: Math.random() * Math.PI * 2,
    n: [],
  }));

  stars.forEach((star, index) => {
    stars.slice(index + 1).forEach((target, offset) => {
      if (Math.hypot((star.x - target.x) * 1920, (star.y - target.y) * 1080) < 90 && Math.random() < 0.09) {
        star.n.push(index + 1 + offset);
      }
    });
  });

  const resize = () => [cvA, cvS, cvW, cvT].forEach((canvas) => {
    if (!canvas) return;
    canvas.width = w.innerWidth;
    canvas.height = w.innerHeight;
  });
  resize();
  w.addEventListener('resize', resize);
  session.cleanups.push(() => w.removeEventListener('resize', resize));

  const mouse = {
    x: w.innerWidth / 2,
    y: w.innerHeight / 2,
    px: 0,
    py: 0,
  };
  const onMouseMove = (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.px = ((event.clientX / w.innerWidth) - 0.5) * 2;
    mouse.py = ((event.clientY / w.innerHeight) - 0.5) * 2;
  };
  doc.addEventListener('mousemove', onMouseMove);
  session.cleanups.push(() => doc.removeEventListener('mousemove', onMouseMove));

  for (let i = 0; i < 24; i += 1) {
    const el = doc.createElement('div');
    el.className = 'rune-f';
    el.textContent = RUNES[Math.floor(Math.random() * RUNES.length)];
    el.style.left = `${4 + (Math.random() * 92)}%`;
    el.style.top = `${4 + (Math.random() * 92)}%`;
    el.style.fontSize = `${11 + (Math.random() * 24)}px`;
    el.style.animationDuration = `${14 + (Math.random() * 22)}s`;
    el.style.animationDelay = `${-Math.random() * 18}s`;
    doc.getElementById('pxLayer')?.appendChild(el);
  }

  const spawn = () => wisps.push({
    x: Math.random() * w.innerWidth,
    y: w.innerHeight + 6,
    vx: (Math.random() - 0.5) * 13,
    vy: -(6 + (Math.random() * 22)),
    life: 5 + (Math.random() * 6),
    ml: 11,
    sz: 0.8 + (Math.random() * 2.2),
    c: WCOLORS[Math.floor(Math.random() * 3)],
    a: true,
  });
  const interval = w.setInterval(spawn, 105);
  session.cleanups.push(() => w.clearInterval(interval));

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
    const angle = ((i / n) * Math.PI * 2) + (Math.random() * 0.5);
    const speed = 40 + (Math.random() * 125);
    wisps.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: (Math.sin(angle) * speed) - 28,
      life: 0.9 + (Math.random() * 1.1),
      ml: 2,
      sz: 1.2 + (Math.random() * 3),
      c: WCOLORS[Math.floor(Math.random() * WCOLORS.length)],
      a: false,
    });
  }
}

export function runEndingScene(doc, deps, payload, wisps, session, burst) {
  const reveal = [
    { id: 's0', d: 400 },
    { id: 's1', d: 900 },
    { id: 's2', d: 1600 },
    { id: 's3', d: 3800 },
    { id: 's4', d: 4100 },
    { id: 's5', d: 4600 },
    { id: 's6', d: 5200 },
    { id: 's6b', d: 5600 },
    { id: 's7', d: 5900 },
    { id: 's8', d: 6300 },
  ];

  reveal.forEach((step) => {
    session.timers.push(winOf(deps).setTimeout(() => doc.getElementById(step.id)?.classList.add('show'), step.d));
  });

  const quote = doc.getElementById('quote');
  const cursor = doc.getElementById('qcursor');
  if (quote && cursor) {
    quote.textContent = '';
    quote.appendChild(cursor);
    let index = 0;
    const step = () => {
      if (index >= payload.quote.length) {
        session.timers.push(winOf(deps).setTimeout(() => {
          cursor.style.display = 'none';
        }, 1200));
        return;
      }
      const ch = payload.quote[index];
      if (ch === '\n') {
        quote.insertBefore(doc.createElement('br'), cursor);
      } else {
        const span = doc.createElement('span');
        span.textContent = ch;
        quote.insertBefore(span, cursor);
      }
      index += 1;
      session.timers.push(winOf(deps).setTimeout(step, 38));
    };
    session.timers.push(winOf(deps).setTimeout(step, 1600));
  }

  [
    ['sv0', payload.stats[0].value, 550],
    ['sv1', payload.stats[1].value, 500],
    ['sv2', payload.stats[2].value, 950],
    ['sv3', payload.stats[3].value, 850],
    ['sv4', payload.stats[4].value, 700],
  ].forEach(([id, target, duration], index) => {
    session.timers.push(winOf(deps).setTimeout(() => {
      const element = doc.getElementById(id);
      if (!element) return;
      const start = performance.now();
      const raf = rafOf(deps);
      const caf = cafOf(deps);
      let rid = 0;
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - ((1 - t) ** 3);
        element.textContent = fmt(Math.floor(num(target) * eased));
        if (t < 1) rid = raf(tick);
      };
      rid = raf(tick);
      session.cleanups.push(() => caf(rid));
    }, 4100 + (index * 120)));
  });

  session.timers.push(winOf(deps).setTimeout(() => {
    const line = doc.getElementById('tlLine');
    const track = doc.querySelector('.tl-track');
    if (line && track) line.style.width = `${track.offsetWidth - 32}px`;
  }, 4800));

  session.timers.push(winOf(deps).setTimeout(() => {
    const clear = doc.getElementById('clrT');
    if (clear) clear.textContent = payload.clear;
  }, 5200));

  session.timers.push(winOf(deps).setTimeout(() => {
    for (let i = 0; i < 8; i += 1) {
      session.timers.push(winOf(deps).setTimeout(() => {
        burst(
          wisps,
          winOf(deps).innerWidth * (0.12 + (Math.random() * 0.76)),
          winOf(deps).innerHeight * (0.12 + (Math.random() * 0.76)),
          13,
        );
      }, i * 200));
    }
    (deps.audioEngine || globalThis.GAME?.Audio || globalThis.AudioEngine)?.playResonanceBurst?.();
  }, 1200));
}
