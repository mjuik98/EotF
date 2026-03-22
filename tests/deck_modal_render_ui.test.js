import { describe, expect, it } from 'vitest';

import {
  applyDeckFilterButtonStyles,
  buildDeckModalEntries,
  renderDeckModalCards,
  renderDeckStatusBar,
} from '../game/ui/cards/deck_modal_render_ui.js';

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.style = {};
    this.className = '';
    this._textContent = '';
    this._innerHTML = '';
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this.children = [];
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
  const elements = new Map();
  return {
    createElement(tagName) {
      return new MockElement(tagName);
    },
    getElementById(id) {
      return elements.get(id) || null;
    },
    register(id, element) {
      elements.set(id, element);
    },
  };
}

describe('deck_modal_render_ui', () => {
  it('builds sorted and filtered modal entries', () => {
    const result = buildDeckModalEntries({
      player: {
        deck: ['rare_card', 'common_card', 'rare_card'],
        hand: ['common_card'],
        graveyard: ['rare_card'],
      },
    }, {
      cards: {
        common_card: { rarity: 'common', type: 'ATTACK' },
        rare_card: { rarity: 'rare', type: 'SKILL', upgraded: true },
      },
    }, 'upgraded');

    expect(result.deckCount).toBe(3);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].id).toBe('rare_card');
    expect(result.entries[0].count).toBe(2);
    expect(result.entries[0].inGraveyard).toBe(true);
  });

  it('renders status bar, cards, and filter button state', () => {
    const doc = createDoc();
    const bar = new MockElement('div');
    const cardsEl = new MockElement('div');
    const attackBtn = new MockElement('button');
    const allBtn = new MockElement('button');
    doc.register('deckFilter_ATTACK', attackBtn);
    doc.register('deckFilter_all', allBtn);

    renderDeckStatusBar(doc, bar, { deckCount: 4, handCount: 1, graveCount: 2 });
    expect(bar.children).toHaveLength(5);

    renderDeckModalCards(doc, cardsEl, [{
      id: 'strike',
      count: 2,
      inHand: true,
      inGraveyard: false,
      card: { rarity: 'rare', type: 'ATTACK', cost: 1, icon: '⚔', name: 'Strike', desc: 'Deal damage' },
    }], {
      highlightDescription: (text) => `<b>${text}</b>`,
    });
    expect(cardsEl.children).toHaveLength(1);
    const card = cardsEl.children[0];
    expect(card.className).toContain('card-frame-variant-deck');
    expect(card.children.some((child) => child.className === 'card-location-tag')).toBe(true);
    expect(card.children.some((child) => child.className === 'card-rarity-strip card-rarity-strip-rare')).toBe(true);
    expect(card.children.some((child) => child.className === 'card-crystal-facet card-crystal-facet-type-attack')).toBe(true);
    expect(card.children.at(-1)?.textContent).toBe('공격');

    applyDeckFilterButtonStyles(doc, 'ATTACK');
    expect(attackBtn.style.background).toBe('rgba(255,80,100,0.2)');
    expect(allBtn.style.background).toBe('transparent');
  });
});
