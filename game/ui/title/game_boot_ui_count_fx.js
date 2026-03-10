import { getWin } from './game_boot_ui_helpers.js';

export function countUp(el, target, durationMs, suffix = '') {
  if (!el) return;
  let startTs = 0;
  const win = getWin();

  const step = (ts) => {
    if (!startTs) startTs = ts;
    const progress = Math.min((ts - startTs) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.floor(eased * target)}${suffix}`;
    if (progress < 1 && typeof win.requestAnimationFrame === 'function') {
      win.requestAnimationFrame(step);
      return;
    }
    el.textContent = `${target}${suffix}`;
  };

  if (typeof win.requestAnimationFrame === 'function') {
    win.requestAnimationFrame(step);
  } else {
    el.textContent = `${target}${suffix}`;
  }
}
