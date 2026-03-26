import { SettingsManager } from '../../platform/browser/settings_manager.js';

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
