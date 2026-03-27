import { getInputBindingCode, getInputBindingMap } from './input_binding_resolver.js';

export function keyboardEventMatchesCode(event, code) {
  if (!event || !code) return false;
  if (event.code === code) return true;

  if (code === 'Escape') return event.key === 'Escape' || event.key === 'Esc';
  if (code === 'Enter') return event.key === 'Enter';
  if (code === 'Tab') return event.key === 'Tab';
  if (code === 'Slash') return event.key === '/' || event.key === '?';
  if (code === 'Space') return event.key === ' ' || event.key === 'Spacebar';

  if (code.startsWith('Key')) {
    return String(event.key || '').toUpperCase() === code.slice(3);
  }
  if (code.startsWith('Digit')) {
    return event.key === code.slice(5);
  }
  return false;
}

export function inputCodeToLabel(code) {
  if (!code || typeof code !== 'string') return '';
  if (code === 'Escape') return 'ESC';
  if (code === 'Enter') return 'Enter';
  if (code === 'Tab') return 'Tab';
  if (code === 'Slash') return '?';
  if (code === 'Space') return 'SPACE';
  if (code.startsWith('Key')) return code.slice(3).toUpperCase();
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Arrow')) {
    const dir = code.slice(5);
    return { Up: 'UP', Down: 'DOWN', Left: 'LEFT', Right: 'RIGHT' }[dir] ?? code;
  }
  return code;
}

export function resolveKeyboardAction(event, bindingMap = {}) {
  for (const [actionId, code] of Object.entries(bindingMap)) {
    if (keyboardEventMatchesCode(event, code)) return actionId;
  }
  return null;
}

export function resolveKeyboardActionFromSettings(event, bindings = null) {
  return resolveKeyboardAction(event, getInputBindingMap(bindings));
}

export function isInputActionBoundTo(event, actionId, fallback = undefined, bindings = null) {
  return keyboardEventMatchesCode(event, getInputBindingCode(actionId, fallback, bindings));
}
