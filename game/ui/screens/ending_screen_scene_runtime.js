import { cafOf, rafOf, winOf } from './ending_screen_helpers.js';

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const fmt = (value) => Math.max(0, Math.floor(num(value, 0))).toLocaleString('ko-KR');
const perfNow = (deps) => {
  if (typeof deps?.performance?.now === 'function') return deps.performance.now();
  if (typeof deps?.win?.performance?.now === 'function') return deps.win.performance.now();
  return Date.now();
};

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
      const start = perfNow(deps);
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
    deps.audioEngine?.playResonanceBurst?.();
  }, 1200));
}
