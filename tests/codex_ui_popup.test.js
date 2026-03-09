import { describe, expect, it } from 'vitest';

import {
  buildCardPopupPayload,
  buildCodexNavBlock,
  buildCodexSetPopupBlock,
  buildEnemyPopupPayload,
  buildItemPopupPayload,
  closeCodexPopup,
  ensureCodexPopupOverlay,
  openCodexPopup,
} from '../game/ui/screens/codex_ui_popup.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.listeners = {};
    this.style = { setProperty: (key, value) => { this.style[key] = value; } };
    this._innerHTML = '';

    this.classList = {
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.add(token));
        this.className = [...next].join(' ');
      },
      remove: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.delete(token));
        this.className = [...next].join(' ');
      },
      contains: (token) => this.className.split(/\s+/).filter(Boolean).includes(token),
    };

    Object.defineProperty(this, 'id', {
      get: () => this._id || '',
      set: (value) => {
        if (this._id) this.ownerDocument._elements.delete(this._id);
        this._id = value;
        if (value) this.ownerDocument._elements.set(value, this);
      },
    });

    Object.defineProperty(this, 'innerHTML', {
      get: () => this._innerHTML,
      set: (value) => {
        this._innerHTML = String(value ?? '');
      },
    });
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }
}

function createDoc() {
  const doc = {
    _elements: new Map(),
    body: null,
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
  doc.body = new MockElement(doc, 'body');
  return doc;
}

describe('codex_ui_popup', () => {
  it('creates and toggles the popup overlay shell', () => {
    const doc = createDoc();

    const overlay = ensureCodexPopupOverlay(doc, () => {});
    openCodexPopup(doc);
    expect(overlay.id).toBe('cxDetailPopup');
    expect(overlay.classList.contains('open')).toBe(true);

    closeCodexPopup(doc);
    expect(overlay.classList.contains('open')).toBe(false);
  });

  it('builds nav and set blocks from current state', () => {
    const nav = buildCodexNavBlock([{ name: 'A' }, { name: 'B' }, { name: 'C' }], 1);
    const setBlock = buildCodexSetPopupBlock(
      { set: 'void' },
      {
        itemSets: {
          void: { name: 'Void Set', effect: 'Bonus', items: ['a', 'b'], color: '#00ffcc' },
        },
        items: {
          a: { id: 'a', name: 'A' },
          b: { id: 'b', name: 'B' },
        },
      },
      { meta: { codex: { enemies: new Set(), cards: new Set(), items: new Set(['a']) } } },
    );

    expect(nav).toContain('2 / 3');
    expect(nav).toContain('A');
    expect(nav).toContain('C');
    expect(setBlock).toContain('Void Set');
    expect(setBlock).toContain('1/2 보유');
  });

  it('builds popup payloads for enemy/card/item entries', () => {
    const enemyPayload = buildEnemyPopupPayload(
      { id: 'wolf', name: 'Wolf', isElite: true, icon: 'W', atk: 5, hp: 12 },
      { safeHtml: (value) => value, navHtml: '<nav />', quoteHtml: '<quote />' },
    );
    const cardPayload = buildCardPopupPayload(
      { id: 'strike', name: 'Strike', type: 'ATTACK', rarity: 'common', cost: 1, desc: 'Deal 6', icon: 'S' },
      { gs: { meta: { codexRecords: { cards: { strike: { used: 4 } } } } }, data: { cards: {} }, safeHtml: (value) => value },
    );
    const itemPayload = buildItemPopupPayload(
      { id: 'relic', name: 'Relic', rarity: 'rare', desc: 'Gain power', icon: 'R', set: 'void' },
      {
        gs: { meta: { codex: { enemies: new Set(), cards: new Set(), items: new Set(['relic']) }, codexRecords: { items: { relic: { found: 2 } } } } },
        data: { itemSets: { void: { name: 'Void Set', items: ['relic'], effect: 'Bonus' } }, items: { relic: { id: 'relic', name: 'Relic' } } },
        safeHtml: (value) => value,
      },
    );

    expect(enemyPayload.theme.border).toContain('192,132,252');
    expect(enemyPayload.html).toContain('Wolf');
    expect(cardPayload.html).toContain('Strike');
    expect(cardPayload.html).toContain('사용 횟수');
    expect(itemPayload.html).toContain('Relic');
    expect(itemPayload.html).toContain('Void Set');
  });
});
