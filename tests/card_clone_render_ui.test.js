import { describe, expect, it, vi } from 'vitest';

import { createHandCardCloneElement } from '../game/features/combat/presentation/browser/card_clone_render_ui.js';

class MockClassList {
  constructor(owner) {
    this.owner = owner;
  }

  add(...tokens) {
    const next = new Set(this.owner.className.split(/\s+/).filter(Boolean));
    tokens.forEach((token) => next.add(token));
    this.owner.className = [...next].join(' ');
  }
}

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.classList = new MockClassList(this);
    this._textContent = '';
    this._innerHTML = '';
    this.listeners = new Map();
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
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

function findChild(root, predicate) {
  return root.children.find(predicate) || null;
}

function createDoc() {
  return {
    createElement(tagName) {
      return new MockElement(tagName);
    },
  };
}

describe('card_clone_render_ui', () => {
  it('builds a clone card shell with tags, discounts, and particles', () => {
    const doc = createDoc();
    const rng = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const clone = createHandCardCloneElement(doc, 'echo_strike', {
      name: 'Echo Strike',
      icon: '⚔',
      type: 'Attack',
      cost: 2,
      rarity: 'legendary',
      upgraded: true,
      desc: '[소진] Attack twice',
    }, {
      displayCost: 1,
      anyFree: false,
      totalDisc: 1,
    });

    expect(clone.className).toContain('clone-rarity-legendary');
    expect(clone.children.some((child) => child.className === 'card-rarity-tag card-rarity-tag-hover')).toBe(true);
    expect(clone.children.find((child) => child.className === 'card-rarity-tag card-rarity-tag-hover')?.textContent).toBe('전설');
    expect(clone.children.some((child) => String(child.className).includes('card-cost') && String(child.className).includes('card-cost-hover') && String(child.className).includes('card-cost-discounted'))).toBe(true);
    expect(clone.children.some((child) => child.className === 'card-icon card-icon-hover')).toBe(true);
    expect(clone.children.some((child) => child.className === 'card-name card-name-hover')).toBe(true);
    expect(clone.children.some((child) => child.className === 'card-desc card-desc-hover card-desc-hover-readable')).toBe(true);
    expect(clone.children.some((child) => child.className === 'card-tags card-tags-hover')).toBe(true);
    expect(clone.children.some((child) => child.className === 'card-particles card-particles-aura')).toBe(true);
    expect(clone.children.some((child) => child.className === 'card-clone-keyword-panel')).toBe(true);
    expect(clone.children.find((child) => child.className === 'card-clone-keyword-panel')?.children[0]?.children[0]?.textContent).toBe('소진');
    expect(clone.children.some((child) => child.className === 'card-clone-arrow')).toBe(true);
    expect(clone.children.find((child) => String(child.className).includes('card-type'))).toBeUndefined();

    rng.mockRestore();
  });

  it('renders multiple keyword chips and a visual link to the docked panel', () => {
    const doc = createDoc();

    const clone = createHandCardCloneElement(doc, 'void_blade', {
      name: '공허의 도검',
      icon: '🌀',
      type: 'Attack',
      cost: 2,
      rarity: 'rare',
      desc: '피해 30 [소진]. 기절 1턴 부여',
      exhaust: true,
    }, {
      displayCost: 2,
      anyFree: false,
      totalDisc: 0,
    });

    const keywordPanel = clone.children.find((child) => child.className === 'card-clone-keyword-panel');
    expect(keywordPanel).toBeTruthy();
    expect(clone.children.some((child) => child.className === 'card-clone-keyword-link')).toBe(true);

    const chipRow = keywordPanel.children[0];
    const activeBody = keywordPanel.children[1];
    expect(chipRow.className).toBe('card-clone-keyword-tabs');
    expect(chipRow.children).toHaveLength(2);
    expect(chipRow.children[0].textContent).toBe('소진');
    expect(chipRow.children[1].textContent).toBe('기절');
    expect(activeBody.children[0].textContent).toBe('소진');
  });

  it('keeps hover clones ready with a mechanics trigger row and a closed keyword panel by default', () => {
    const doc = createDoc();

    const clone = createHandCardCloneElement(doc, 'heavy_blow', {
      name: 'Heavy Blow',
      icon: '💥',
      type: 'Attack',
      cost: 3,
      rarity: 'common',
      desc: '[소진] 피해 18',
      exhaust: true,
    }, {
      displayCost: 3,
      anyFree: false,
      totalDisc: 0,
    });

    const mechanicsRow = clone.children.find((child) => child.className === 'card-hover-mechanics');
    expect(mechanicsRow).toBeTruthy();
    expect(mechanicsRow.children).toHaveLength(1);
    expect(mechanicsRow.children[0].textContent).toBe('소진');
    expect(clone.children.find((child) => child.className === 'card-clone-keyword-panel')?.dataset?.open).toBe('false');
  });

  it('applies centralized hover keyword layout options to the clone shell', () => {
    const doc = createDoc();

    const clone = createHandCardCloneElement(doc, 'void_blade', {
      name: '공허의 도검',
      icon: '🌀',
      type: 'Attack',
      cost: 2,
      rarity: 'rare',
      desc: '피해 30 [소진]. 기절 1턴 부여',
      exhaust: true,
    }, {
      displayCost: 2,
      anyFree: false,
      totalDisc: 0,
    });

    const keywordPanel = findChild(clone, (child) => child.className === 'card-clone-keyword-panel');
    const chipRow = keywordPanel?.children?.[0];

    expect(clone.style['--hover-keyword-panel-width']).toBe('176px');
    expect(clone.style['--hover-keyword-panel-gap']).toBe('12px');
    expect(clone.style['--hover-keyword-connector-length']).toBeTruthy();
    expect(chipRow?.className).toBe('card-clone-keyword-tabs');
    expect(chipRow?.children?.[0]?.className).toContain('card-clone-keyword-tab');
  });
});
