import { describe, expect, it } from 'vitest';

import {
  applyDeckFilterButtonStyles,
  buildDeckModalEntries,
  renderDeckModalCards,
  renderDeckStatusBar,
} from '../game/features/combat/public.js';

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.style = {};
    this.className = '';
    this.tabIndex = -1;
    this.attributes = {};
    this.listeners = {};
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

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this._innerHTML = '';
    this.children = [];
  }

  get textContent() {
    return this._textContent;
  }

  set innerHTML(value) {
    this._innerHTML = String(value ?? '');
    this._textContent = this._innerHTML.replace(/<[^>]+>/g, '');
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
    expect(card.children.some((child) => String(child.className).includes('card-desc-deck'))).toBe(true);
    expect(card.children.some((child) => child.className === 'card-location-tag')).toBe(true);
    expect(card.children.some((child) => child.className === 'card-rarity-strip card-rarity-strip-rare')).toBe(true);
    expect(card.children.some((child) => child.className === 'card-crystal-facet card-crystal-facet-type-attack')).toBe(true);
    expect(card.children.at(-1)?.textContent).toBe('공격');
    expect(card.tabIndex).toBe(0);
    expect(card.listeners.focus).toBeTypeOf('function');
    expect(card.listeners.blur).toBeTypeOf('function');

    applyDeckFilterButtonStyles(doc, 'ATTACK');
    expect(attackBtn.style.background).toBe('rgba(255,80,100,0.2)');
    expect(allBtn.style.background).toBe('transparent');
  });

  it('renders deck descriptions and type labels as separate nodes', () => {
    const doc = createDoc();
    const cardsEl = new MockElement('div');

    renderDeckModalCards(doc, cardsEl, [
      {
        id: 'strike_plus',
        count: 1,
        inHand: false,
        inGraveyard: false,
        card: {
          rarity: 'common',
          type: 'ATTACK',
          cost: 1,
          icon: '👊🏻',
          name: '타격+',
          desc: '피해 13. 잔향 5 충전',
          upgraded: true,
        },
      },
      {
        id: 'heavy_blow_plus',
        count: 1,
        inHand: false,
        inGraveyard: false,
        card: {
          rarity: 'rare',
          type: 'ATTACK',
          cost: 3,
          icon: '🔨',
          name: '중격+',
          desc: '피해 28. 기절 1턴 부여',
          upgraded: true,
        },
      },
    ]);

    const strikeCard = cardsEl.children[0];
    const heavyBlowCard = cardsEl.children[1];
    const strikeDesc = strikeCard.children.find((child) => String(child.className).includes('deck-card-desc'));
    const heavyBlowDesc = heavyBlowCard.children.find((child) => String(child.className).includes('deck-card-desc'));
    const strikeType = strikeCard.children.find((child) => String(child.className).includes('card-type'));
    const heavyBlowType = heavyBlowCard.children.find((child) => String(child.className).includes('card-type'));

    expect(strikeDesc?.textContent).toContain('피해 13');
    expect(heavyBlowDesc?.textContent).toContain('피해 28');
    expect(strikeType?.textContent).toBe('공격 ✦');
    expect(heavyBlowType?.textContent).toBe('공격 ✦');
  });

  it('styles deck modal descriptions with a readable deck-specific text block', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toMatch(/\.card-desc-deck,\s*\.deck-card-desc \{\s*display: block;\s*font-size: 11\.5px;\s*line-height: 1\.66;\s*color: rgba\(224, 218, 242, 0\.94\);\s*text-align: left;\s*word-break: keep-all;\s*overflow-wrap: anywhere;\s*\}/);
  });

  it('styles deck modal keyword highlights with the same readable comparison palette', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('.deck-card-desc .kw-dmg');
    expect(source).toContain('.deck-card-desc .kw-shield');
    expect(source).toContain('.deck-card-desc .kw-draw');
    expect(source).toContain('.deck-card-desc .kw-buff.kw-block');
  });
});
