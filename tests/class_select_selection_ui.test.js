import { describe, expect, it, vi } from 'vitest';
import {
  applyClassSelectionState,
  clearClassSelection,
  normalizeClassId,
  selectClassButton,
  selectClassById,
} from '../game/ui/title/class_select_selection_ui.js';

function createClassList() {
  const set = new Set();
  return {
    add: (...tokens) => tokens.forEach((token) => set.add(token)),
    remove: (...tokens) => tokens.forEach((token) => set.delete(token)),
    contains: (token) => set.has(token),
  };
}

function createButton(classId) {
  return {
    dataset: { class: classId },
    style: {},
    classList: createClassList(),
  };
}

describe('class select selection helper', () => {
  it('normalizes class ids from strings and numeric indices', () => {
    const order = ['swordsman', 'mage'];
    expect(normalizeClassId('mage', order)).toBe('mage');
    expect(normalizeClassId(' 1 ', order)).toBe('mage');
    expect(normalizeClassId(0, order)).toBe('swordsman');
    expect(normalizeClassId('missing', order)).toBe(null);
  });

  it('applies selection state and updates avatar UI', () => {
    const startBtn = { disabled: true };
    const hint = { style: {} };
    const avatar = { style: {}, textContent: '' };
    const portrait = { style: {}, textContent: '' };
    const setSelectedClass = vi.fn();
    const playClassSelect = vi.fn();
    const doc = {
      getElementById: vi.fn((id) => ({
        startBtn,
        classSelectHint: hint,
        playerAvatar: avatar,
        playerPortraitFallback: portrait,
      }[id] || null)),
    };

    applyClassSelectionState('mage', {
      doc,
      setSelectedClass,
      playClassSelect,
      data: {
        classes: {
          mage: { emoji: '🪄' },
        },
      },
    });

    expect(setSelectedClass).toHaveBeenCalledWith('mage');
    expect(startBtn.disabled).toBe(false);
    expect(hint.style.opacity).toBe('0');
    expect(avatar.textContent).toBe('🪄');
    expect(portrait.style.display).toBe('flex');
    expect(playClassSelect).toHaveBeenCalledWith('mage');
  });

  it('selects, reselects by id, and clears button state through helpers', () => {
    const first = createButton('swordsman');
    const second = createButton('mage');
    const startBtn = { disabled: true };
    const timers = [];
    let selected = null;
    const doc = {
      getElementById: vi.fn((id) => (id === 'startBtn' ? startBtn : null)),
      querySelectorAll: vi.fn(() => [first, second]),
    };

    selectClassButton(second, {
      doc,
      classIdOrder: ['swordsman', 'mage'],
      setSelectedClass: (value) => {
        selected = value;
      },
      setTimeoutImpl: (handler, delay) => timers.push({ handler, delay }),
      data: {
        classes: {
          mage: { emoji: '🪄' },
        },
      },
    });

    expect(selected).toBe('mage');
    expect(second.classList.contains('selected')).toBe(true);
    expect(second.style.transform).toBe('scale(1.04) translateY(-4px)');
    expect(timers).toHaveLength(2);
    timers.forEach((timer) => timer.handler());
    expect(second._selecting).toBe(false);
    expect(second.style.transform).toBe('');

    selectClassById('0', {
      doc,
      classIdOrder: ['swordsman', 'mage'],
      setSelectedClass: (value) => {
        selected = value;
      },
      data: {
        classes: {
          swordsman: { emoji: '🗡️' },
        },
      },
    });
    expect(selected).toBe('swordsman');
    expect(first.classList.contains('selected')).toBe(true);
    expect(second.classList.contains('selected')).toBe(false);

    clearClassSelection({
      doc,
      setSelectedClass: (value) => {
        selected = value;
      },
    });
    expect(selected).toBe(null);
    expect(startBtn.disabled).toBe(true);
    expect(first.classList.contains('selected')).toBe(false);
  });
});
