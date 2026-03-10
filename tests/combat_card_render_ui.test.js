import { describe, expect, it, vi } from 'vitest';

import {
  applyHandFanStyles,
  createCombatCardElement,
} from '../game/ui/cards/combat_card_render_ui.js';

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.className = '';
    this.dataset = {};
    this.style = {
      setProperty: (key, value) => {
        this.style[key] = value;
      },
    };
    this.draggable = false;
    this._textContent = '';
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
  }

  get textContent() {
    return this._textContent;
  }
}

function createDoc() {
  return {
    createElement(tagName) {
      return new MockElement(tagName);
    },
  };
}

describe('combat_card_render_ui', () => {
  it('creates a decorated combat card element', () => {
    const doc = createDoc();
    const rng = vi.spyOn(Math, 'random').mockReturnValue(0.25);

    const el = createCombatCardElement(doc, {
      cardId: 'strike',
      handIndex: 1,
      canPlay: true,
      displayCost: 1,
      anyFree: false,
      totalDisc: 1,
      cardW: 120,
      cardH: 175,
      card: {
        name: 'Strike',
        icon: '⚔',
        type: 'Attack',
        cost: 2,
        rarity: 'rare',
        desc: '[소진] Deal damage',
      },
    });

    expect(el.className).toContain('playable');
    expect(el.className).toContain('rarity-rare');
    expect(el.dataset.cardId).toBe('strike');
    expect(el.children.some((child) => child.className === 'card-rarity-strip card-rarity-strip-rare')).toBe(true);
    expect(el.children.some((child) => child.className === 'card-tags')).toBe(true);
    expect(el.children.some((child) => child.className === 'card-particles')).toBe(true);

    rng.mockRestore();
  });

  it('adds an unavailable overlay and updates hand fan transforms', () => {
    const doc = createDoc();
    const first = createCombatCardElement(doc, {
      cardId: 'guard',
      handIndex: 0,
      canPlay: false,
      displayCost: 2,
      card: { name: 'Guard', icon: '🛡', type: 'Skill', cost: 2, rarity: 'common' },
    });
    const second = createCombatCardElement(doc, {
      cardId: 'chant',
      handIndex: 1,
      canPlay: false,
      displayCost: 3,
      card: { name: 'Chant', icon: '✨', type: 'Power', cost: 3, rarity: 'legendary', upgraded: true },
    });

    applyHandFanStyles([first, second]);

    expect(first.children.some((child) => child.className === 'card-no-energy')).toBe(true);
    expect(second.children.some((child) => child.className === 'card-legendary-border')).toBe(true);
    expect(first.style['--fan-rot']).toBeDefined();
    expect(second.style['--fan-lift']).toBeDefined();
  });
});
