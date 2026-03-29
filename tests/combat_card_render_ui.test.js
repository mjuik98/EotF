import { describe, expect, it, vi } from 'vitest';

import {
  applyHandFanStyles,
  createCombatCardElement,
} from '../game/features/combat/public.js';

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
    this._innerHTML = '';
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

  set innerHTML(value) {
    this._innerHTML = String(value ?? '');
  }

  get innerHTML() {
    return this._innerHTML;
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
    expect(el.children.some((child) => child.className === 'card-rarity-tag')).toBe(true);
    expect(el.children.find((child) => child.className === 'card-rarity-tag')?.textContent).toBe('희귀');
    expect(el.children.some((child) => child.className === 'card-rarity-strip card-rarity-strip-rare')).toBe(true);
    expect(el.children.some((child) => child.className === 'card-icon')).toBe(true);
    expect(el.children.some((child) => child.className === 'card-name')).toBe(true);
    expect(el.children.some((child) => child.className === 'card-desc')).toBe(true);
    expect(el.children.some((child) => child.className === 'card-tags')).toBe(true);
    expect(el.children.some((child) => child.className === 'card-particles')).toBe(true);
    expect(el.children.find((child) => String(child.className).includes('card-type'))).toBeUndefined();

    rng.mockRestore();
  });

  it('adds an unavailable overlay and updates hand fan transforms', () => {
    const doc = createDoc();
    const first = createCombatCardElement(doc, {
      cardId: 'guard',
      handIndex: 0,
      canPlay: false,
      energy: 0,
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

    const firstCost = first.children.find((child) => String(child.className).includes('card-cost'));
    const firstOverlay = first.children.find((child) => child.className === 'card-no-energy');

    expect(first.children.some((child) => child.className === 'card-no-energy')).toBe(true);
    expect(firstCost.className).toContain('card-cost-disabled');
    expect(firstCost.className).toContain('card-cost-insufficient-energy');
    expect(firstOverlay.children[0].textContent).toBe('에너지 2 부족');
    expect(second.children.some((child) => child.className === 'card-legendary-border')).toBe(true);
    expect(first.children.find((child) => String(child.className).includes('card-type'))).toBeUndefined();
    expect(second.children.find((child) => String(child.className).includes('card-type'))).toBeUndefined();
    expect(first.style['--fan-rot']).toBeDefined();
    expect(second.style['--fan-lift']).toBeDefined();
  });
});
