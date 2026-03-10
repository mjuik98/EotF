import { describe, expect, it, vi } from 'vitest';
import {
  createRewardBlessings,
  renderRewardOptions,
} from '../game/ui/screens/reward_ui_options.js';

function querySelectorAllByClass(root, selector) {
  if (typeof selector !== 'string' || !selector.startsWith('.')) return [];
  const required = selector.slice(1).split('.').filter(Boolean);
  const found = [];
  const walk = (node) => {
    for (const child of node.children || []) {
      if (child?.classList && required.every((token) => child.classList.contains(token))) {
        found.push(child);
      }
      walk(child);
    }
  };
  walk(root);
  return found;
}

function createMockElement(tag = 'div') {
  const classes = new Set();
  const attributes = {};
  const element = {
    tagName: String(tag).toUpperCase(),
    children: [],
    style: {},
    dataset: {},
    disabled: false,
    title: '',
    type: '',
    innerHTML: '',
    _textContent: '',
    set textContent(value) {
      this._textContent = value == null ? '' : String(value);
      if (this._textContent === '') this.children = [];
    },
    get textContent() {
      return this._textContent;
    },
    setAttribute(name, value) {
      attributes[name] = String(value);
    },
    getAttribute(name) {
      return attributes[name];
    },
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    addEventListener: vi.fn(),
    querySelectorAll(selector) {
      return querySelectorAllByClass(this, selector);
    },
  };

  Object.defineProperty(element, 'className', {
    get() {
      return [...classes].join(' ');
    },
    set(value) {
      classes.clear();
      String(value || '')
        .split(/\s+/)
        .filter(Boolean)
        .forEach((token) => classes.add(token));
    },
    configurable: true,
  });

  element.classList = {
    add: (...tokens) => tokens.forEach((token) => classes.add(token)),
    remove: (...tokens) => tokens.forEach((token) => classes.delete(token)),
    contains: (token) => classes.has(token),
  };

  return element;
}

function createMockDoc() {
  return {
    createElement: vi.fn((tag) => createMockElement(tag)),
    getElementById: vi.fn(() => null),
  };
}

describe('reward_ui_options', () => {
  it('disables the energy blessing when the player is already at the cap', () => {
    const blessings = createRewardBlessings({
      player: {
        maxEnergy: 5,
        maxEnergyCap: 5,
      },
    });

    expect(blessings[1]).toEqual(expect.objectContaining({
      id: 'blessing_energy',
      disabled: true,
    }));
    expect(blessings[1].disabledReason).toContain('5');
  });

  it('renders boss reward cards, blessings, and relic options through the shared helper', () => {
    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0);

    const doc = createMockDoc();
    const container = createMockElement('div');
    const triggerItems = vi.fn(() => 2);
    const data = {
      cards: {
        card_a: {
          id: 'card_a',
          name: 'Card A',
          desc: 'desc',
          rarity: 'common',
          type: 'attack',
          cost: 1,
        },
      },
      items: {
        boss_relic_a: { id: 'boss_relic_a', name: 'Boss Relic A', desc: 'relic', rarity: 'boss' },
        boss_relic_b: { id: 'boss_relic_b', name: 'Boss Relic B', desc: 'relic', rarity: 'boss' },
      },
      classes: {},
    };
    const gs = {
      player: {
        maxEnergy: 3,
        items: [],
      },
      triggerItems,
    };

    try {
      renderRewardOptions({
        container,
        rewardMode: 'boss',
        isElite: false,
        rewardCards: ['card_a'],
        data,
        gs,
        deps: { doc },
        onTakeCard: vi.fn(),
        onTakeBlessing: vi.fn(),
        onTakeItem: vi.fn(),
      });
    } finally {
      Math.random = originalRandom;
    }

    expect(container.children).toHaveLength(5);
    expect(container.children.map((child) => child.getAttribute('aria-label'))).toEqual([
      'Card A card reward',
      'Vital Blessing blessing reward',
      'Energy Blessing blessing reward',
      'Boss Relic A item reward',
      'Boss Relic B item reward',
    ]);
    expect(triggerItems).toHaveBeenCalledWith('reward_generate', { type: 'item', count: 1 });
  });
});
