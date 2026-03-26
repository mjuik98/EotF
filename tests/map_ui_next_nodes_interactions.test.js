import { describe, expect, it, vi } from 'vitest';

import { bindNextNodeCardInteractions } from '../game/features/run/presentation/browser/map_ui_next_nodes_interactions.js';
import { buildNextNodeCard } from '../game/features/run/presentation/browser/map_ui_next_nodes_render.js';

function createCard() {
  const listeners = {};
  return {
    style: {},
    dataset: {},
    attributes: {},
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    setAttribute(name, value) {
      this.attributes[name] = String(value);
      this[name] = String(value);
    },
    listeners,
  };
}

describe('map_ui_next_nodes_interactions', () => {
  it('makes next-node cards keyboard-focusable and applies focus parity for hover tint', () => {
    const card = createCard();
    const hoverTint = { style: {} };
    const moveToNode = vi.fn();

    bindNextNodeCardInteractions({
      card,
      deps: { moveToNode },
      doc: {},
      hoverTint,
      meta: { color: '#cc2244' },
      moveToNodeHandlerName: 'moveToNode',
      node: { id: 'n1' },
      win: {},
    });

    expect(card.tabindex).toBe('0');
    expect(card.role).toBe('button');
    expect(typeof card.listeners.focus).toBe('function');
    expect(typeof card.listeners.blur).toBe('function');
    expect(typeof card.listeners.keydown).toBe('function');

    card.listeners.focus();
    expect(hoverTint.style.background).toContain('rgba(204, 34, 68');

    card.listeners.blur();
    expect(hoverTint.style.background).toBe('transparent');

    const keyEvent = { key: 'Enter', preventDefault: vi.fn() };
    card.listeners.keydown(keyEvent);
    expect(keyEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('builds next-node cards with an aria label for keyboard and screen reader users', () => {
    const doc = {
      createElement() {
        return createCard();
      },
    };
    const { card } = buildNextNodeCard(doc, {
      node: { id: '1-0', floor: 1, pos: 0, type: 'elite' },
      meta: { icon: 'E', label: 'Elite', color: '#cc2244', desc: '피해 14. 잔향 20 충전 [소진]' },
    });

    expect(card['aria-label']).toContain('Elite');
    expect(card['aria-label']).toContain('피해 14. 잔향 20 충전 [소진]');
  });
});
