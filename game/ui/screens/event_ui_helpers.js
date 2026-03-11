import { getAudioEngine as resolveAudioEngine, getRaf } from '../../utils/runtime_deps.js';

const OVERLAY_DISMISS_MS = 320;

export function getEventId(event) {
  if (!event || typeof event !== 'object') return 'unknown';
  return event.id || event.key || event.title || 'unknown';
}

export function getDoc(deps) {
  return deps?.doc || document;
}

export function getGS(deps) {
  return deps?.gs;
}

export function getData(deps) {
  return deps?.data;
}

export function getRunRules(deps) {
  return deps?.runRules;
}

export function getAudioEngine(deps) {
  return resolveAudioEngine(deps);
}

function nextFrame(cb, deps = {}) {
  const raf = getRaf(deps);
  if (typeof raf === 'function') {
    raf(cb);
    return;
  }
  setTimeout(cb, 16);
}

export function dismissTransientOverlay(overlay, onDone, deps = {}) {
  if (!overlay) {
    onDone?.();
    return;
  }

  overlay.style.pointerEvents = 'none';
  overlay.style.opacity = '1';
  overlay.style.filter = 'blur(0)';
  overlay.style.transform = 'translateY(0) scale(1)';
  overlay.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';

  nextFrame(() => {
    overlay.style.opacity = '0';
    overlay.style.filter = 'blur(12px)';
    overlay.style.transform = 'translateY(10px) scale(0.985)';
  }, deps);

  setTimeout(() => {
    overlay.remove();
    onDone?.();
  }, OVERLAY_DISMISS_MS);
}

export function dismissEventModal(modal, onDone, deps = {}) {
  if (!modal) {
    onDone?.();
    return;
  }

  modal.classList.remove('active');
  modal.style.display = 'flex';
  modal.style.pointerEvents = 'none';
  modal.style.opacity = '1';
  modal.style.filter = 'blur(0)';
  modal.style.transform = 'translateY(0) scale(1)';
  modal.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';

  nextFrame(() => {
    modal.style.opacity = '0';
    modal.style.filter = 'blur(10px)';
    modal.style.transform = 'translateY(10px) scale(0.985)';
  }, deps);

  setTimeout(() => {
    modal.style.display = '';
    modal.style.pointerEvents = '';
    modal.style.opacity = '';
    modal.style.filter = '';
    modal.style.transform = '';
    modal.style.transition = '';
    onDone?.();
  }, OVERLAY_DISMISS_MS);
}

export function isChoiceDisabled(choice, gs) {
  if (!choice) return false;
  if (typeof choice.isDisabled === 'function') return !!choice.isDisabled(gs);
  return !!choice.disabled;
}

export function hexToRgb(hex, fallback = [255, 255, 255]) {
  const raw = String(hex || '').trim();
  const normalized = raw.startsWith('#') ? raw.slice(1) : raw;
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return [0, 2, 4].map((idx) => parseInt(normalized.slice(idx, idx + 2), 16));
  }
  return fallback;
}

export function getShopItemIcon(item, rarity = 'common') {
  const raw = String(item?.icon || '').trim();
  if (raw && raw !== '?' && !raw.includes('??')) {
    const asciiOnly = /^[\x20-\x7E]+$/.test(raw);
    if (!asciiOnly) return raw;
  }

  const fallback = {
    common: '*',
    uncommon: '+',
    rare: '!',
    legendary: '@',
  };
  return fallback[rarity] || '*';
}
