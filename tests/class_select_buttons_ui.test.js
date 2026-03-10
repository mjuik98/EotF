import { describe, expect, it, vi } from 'vitest';
import { renderClassSelectButtons } from '../game/ui/title/class_select_buttons_ui.js';

function createInteractiveNode() {
  const listeners = {};
  return {
    style: {},
    listeners,
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
  };
}

function createButtonNode() {
  const trait = createInteractiveNode();
  const relic = createInteractiveNode();
  return {
    id: '',
    className: '',
    dataset: {},
    innerHTML: '',
    querySelector: vi.fn((selector) => {
      if (selector === '.class-btn-trait') return trait;
      if (selector === '.class-btn-relic') return relic;
      return null;
    }),
    _trait: trait,
    _relic: relic,
  };
}

describe('class select buttons helper', () => {
  it('renders class buttons and wires trait/relic tooltips', () => {
    const appended = [];
    const container = {
      innerHTML: 'stale',
      appendChild: vi.fn((node) => appended.push(node)),
    };
    const showTooltip = vi.fn();
    const hideTooltip = vi.fn();
    const doc = {
      createElement: vi.fn(() => createButtonNode()),
    };

    renderClassSelectButtons(container, {
      doc,
      showTooltip,
      hideTooltip,
      rarityLabels: { common: '일반' },
      data: {
        classes: {
          swordsman: {
            id: 0,
            emoji: '🗡️',
            name: '잔향검사',
            style: 'swordsman',
            desc: 'desc',
            traitName: '공명',
            traitTitle: '공명',
            traitDesc: 'trait desc',
            startRelic: 'dull_blade',
          },
        },
        items: {
          dull_blade: {
            icon: '⚔',
            name: '둔검',
            rarity: 'common',
            desc: 'item desc',
          },
        },
      },
    });

    expect(container.innerHTML).toBe('');
    expect(appended).toHaveLength(1);
    const button = appended[0];
    expect(button.id).toBe('class_0');
    expect(button.dataset.class).toBe(0);
    expect(button.innerHTML).toContain('잔향검사');

    button._trait.listeners.mouseenter({ stopPropagation: vi.fn() });
    expect(showTooltip).toHaveBeenCalledWith(expect.anything(), '공명', 'trait desc');
    button._trait.listeners.mouseleave();
    expect(hideTooltip).toHaveBeenCalledTimes(1);

    button._relic.listeners.mouseenter({ stopPropagation: vi.fn() });
    expect(showTooltip).toHaveBeenCalledWith(expect.anything(), '⚔ 둔검 (일반)', 'item desc');
  });
});
