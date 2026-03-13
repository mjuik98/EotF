import { SettingsManager } from '../../../../core/settings_manager.js';

export function getDoc(deps) {
  return deps?.doc || deps?.win?.document || null;
}

export function isInGame(gs) {
  return (
    gs?.currentScreen === 'game'
    || gs?.currentScreen === 'combat'
    || gs?.currentScreen === 'reward'
    || gs?.combat?.active === true
  );
}

export function resolveGs(deps = {}) {
  return deps?.gs
    || deps?.State
    || deps?.state
    || null;
}

export function clearActiveRunSave(deps = {}) {
  if (typeof deps.clearActiveRunSave === 'function') {
    deps.clearActiveRunSave();
    return;
  }

  const saveSystem = deps.saveSystem || deps.SaveSystem || null;
  saveSystem?.clearSave?.();
}

export function isCombatOverlayActive(doc) {
  const overlay = doc?.getElementById?.('combatOverlay');
  return Boolean(overlay?.classList?.contains('active'));
}

export function isVisibleModal(el, doc) {
  if (!el) return false;
  if (el.hidden) return false;

  const inlineDisplay = String(el.style?.display || '').trim().toLowerCase();
  if (inlineDisplay === 'none') return false;

  const view = doc?.defaultView || null;
  if (typeof view?.getComputedStyle !== 'function') {
    return Boolean(el.classList?.contains('active') || inlineDisplay);
  }

  const computed = view.getComputedStyle(el);
  if (computed.display === 'none') return false;
  if (computed.visibility === 'hidden') return false;

  const opacity = Number.parseFloat(computed.opacity || '1');
  const pointerEvents = String(computed.pointerEvents || '').toLowerCase();
  if (!el.classList?.contains('active') && opacity <= 0 && pointerEvents === 'none') {
    return false;
  }

  return true;
}

export function eventMatchesCode(e, code) {
  if (!e || !code) return false;
  if (e.code === code) return true;

  if (code === 'Escape') return e.key === 'Escape' || e.key === 'Esc';
  if (code === 'Enter') return e.key === 'Enter';
  if (code === 'Tab') return e.key === 'Tab';
  if (code === 'Slash') return e.key === '/' || e.key === '?';

  if (code.startsWith('Key')) {
    return String(e.key || '').toUpperCase() === code.slice(3);
  }
  if (code.startsWith('Digit')) {
    return e.key === code.slice(5);
  }
  return false;
}

export function getKeybindingCode(action, fallback) {
  const code = SettingsManager.get(`keybindings.${action}`);
  if (typeof code === 'string' && code.trim()) return code;
  return fallback;
}

export function keyCodeToLabel(code) {
  if (!code || typeof code !== 'string') return '';
  if (code === 'Escape') return 'ESC';
  if (code === 'Enter') return 'Enter';
  if (code === 'Tab') return 'Tab';
  if (code === 'Slash') return '?';
  if (code === 'Space') return 'SPACE';
  if (code.startsWith('Key')) return code.slice(3).toUpperCase();
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}
