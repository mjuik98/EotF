import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HandCardCloneUI } from '../game/features/combat/presentation/browser/card_clone_ui.js';

class MockClassList {
  constructor() {
    this.values = new Set();
  }

  add(...tokens) {
    tokens.forEach((token) => this.values.add(token));
  }

  remove(...tokens) {
    tokens.forEach((token) => this.values.delete(token));
  }

  contains(token) {
    return this.values.has(token);
  }
}

class MockElement {
  constructor(doc, tagName = 'div', rect = null) {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.listeners = new Map();
    this.classList = new MockClassList();
    this._rect = rect;
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  removeChild(node) {
    this.children = this.children.filter((child) => child !== node);
    node.parentNode = null;
    return node;
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  removeEventListener(type, handler) {
    if (this.listeners.get(type) === handler) this.listeners.delete(type);
  }

  getElementByClassName(className) {
    return this.children.find((child) => child.className === className) || null;
  }

  querySelector(selector) {
    if (selector.startsWith('.')) {
      const className = selector.slice(1);
      if (this.className === className) return this;
      return this.children.find((child) => child.querySelector?.(selector) || child.className === className) || null;
    }
    return null;
  }

  emit(type, event = {}) {
    this.listeners.get(type)?.(event);
  }

  getBoundingClientRect() {
    return this._rect || { left: 500, top: 620, width: 100, height: 146, right: 600, bottom: 766 };
  }
}

function createDoc() {
  const doc = {
    defaultView: {
      innerWidth: 1280,
      innerHeight: 900,
      requestAnimationFrame: (callback) => callback(),
      addEventListener() {},
      removeEventListener() {},
    },
    body: null,
    _elements: new Map(),
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
    querySelectorAll() {
      return [];
    },
  };
  doc.body = new MockElement(doc, 'body');
  return doc;
}

describe('card_clone_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('keeps the preview open while moving from the card to the docked hover group', () => {
    const doc = createDoc();
    const handZone = new MockElement(doc, 'div');
    const card = new MockElement(doc, 'div', { left: 560, top: 640, width: 100, height: 146, right: 660, bottom: 786 });
    doc._elements.set('combatHandCards', handZone);

    HandCardCloneUI.init({ doc });
    HandCardCloneUI.attachToCard(card, 'void_blade', {
      name: '공허의 도검',
      icon: '🌀',
      type: 'Attack',
      cost: 2,
      rarity: 'rare',
      desc: '피해 30 [소진]. 기절 1턴 부여',
      exhaust: true,
    }, {
      displayCost: 2,
      canPlay: true,
      anyFree: false,
      totalDisc: 0,
    }, { doc });

    card.listeners.get('mouseenter')();
    vi.advanceTimersByTime(120);

    const layer = doc.body.children[0];
    const clone = layer.children[0];
    expect(clone).toBeTruthy();

    card.listeners.get('mouseleave')();
    clone.listeners.get('mouseenter')?.();
    vi.advanceTimersByTime(80);

    expect(layer.children).toContain(clone);

    clone.listeners.get('mouseleave')?.();
    vi.advanceTimersByTime(80);
    clone.emit('transitionend');

    expect(layer.children).not.toContain(clone);
  });

  it('opens the keyword side panel and keeps it open when moving from the trigger into the panel', () => {
    const doc = createDoc();
    const handZone = new MockElement(doc, 'div');
    const card = new MockElement(doc, 'div', { left: 560, top: 640, width: 100, height: 146, right: 660, bottom: 786 });
    doc._elements.set('combatHandCards', handZone);

    HandCardCloneUI.init({ doc });
    HandCardCloneUI.attachToCard(card, 'void_blade', {
      name: '공허의 도검',
      icon: '🌀',
      type: 'Attack',
      cost: 2,
      rarity: 'rare',
      desc: '피해 30 [소진]. 기절 1턴 부여',
      exhaust: true,
    }, {
      displayCost: 2,
      canPlay: true,
      anyFree: false,
      totalDisc: 0,
    }, { doc });

    card.listeners.get('mouseenter')();
    vi.advanceTimersByTime(120);

    const layer = doc.body.children[0];
    const clone = layer.children[0];
    const keywordPanel = clone.children.find((child) => child.className === 'card-clone-keyword-panel');
    const trigger = keywordPanel?.children?.[0]?.children?.[0];

    trigger?.listeners.get('mouseenter')?.();
    trigger?.listeners.get('mouseleave')?.({ relatedTarget: keywordPanel });
    keywordPanel?.listeners?.get('mouseenter')?.({ relatedTarget: trigger });
    clone.listeners.get('mouseenter')?.();
    vi.advanceTimersByTime(40);

    expect(keywordPanel?.dataset?.open).toBe('true');
    expect(layer.children).toContain(clone);
  });
});
