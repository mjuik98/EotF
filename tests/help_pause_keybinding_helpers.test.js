import { describe, expect, it } from 'vitest';

import {
  eventMatchesCode,
  keyCodeToLabel,
} from '../game/features/ui/presentation/browser/help_pause_keybinding_helpers.js';

describe('help pause keybinding helpers', () => {
  it('matches legacy key aliases and keyboard event codes', () => {
    expect(eventMatchesCode({ code: 'Escape', key: 'Esc' }, 'Escape')).toBe(true);
    expect(eventMatchesCode({ key: '?' }, 'Slash')).toBe(true);
    expect(eventMatchesCode({ key: 'm' }, 'KeyM')).toBe(true);
    expect(eventMatchesCode({ key: '3' }, 'Digit3')).toBe(true);
    expect(eventMatchesCode({ key: 'x' }, 'Digit3')).toBe(false);
  });

  it('formats keyboard codes into UI labels', () => {
    expect(keyCodeToLabel('Escape')).toBe('ESC');
    expect(keyCodeToLabel('Slash')).toBe('?');
    expect(keyCodeToLabel('KeyK')).toBe('K');
    expect(keyCodeToLabel('Digit7')).toBe('7');
    expect(keyCodeToLabel('')).toBe('');
  });
});
