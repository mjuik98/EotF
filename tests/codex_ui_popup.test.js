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
} from '../game/features/codex/public.js';

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
      { setId: 'void' },
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
      { id: 'judgement', name: 'Judgement', type: 'ATTACK', rarity: 'common', cost: 1, desc: 'Deal 6', icon: 'S' },
      {
        gs: { meta: { codexRecords: { cards: { judgement: { used: 4, upgradedDiscovered: true, upgradeUsed: 1, upgradeFirstSeen: '2026-03-26' } } } } },
        data: { cards: { judgement_plus: { id: 'judgement_plus', type: 'ATTACK', name: 'Judgement+', cost: 2, desc: 'Deal 9' } } },
        safeHtml: (value) => value,
      },
    );
    const itemPayload = buildItemPopupPayload(
      { id: 'serpent_fang_dagger', name: 'Snakefang', rarity: 'rare', desc: 'Gain power', icon: 'R', setId: 'serpents_gaze' },
      {
        gs: { meta: { codex: { enemies: new Set(), cards: new Set(), items: new Set(['serpent_fang_dagger']) }, codexRecords: { items: { serpent_fang_dagger: { found: 2 } } } } },
        data: { items: { serpent_fang_dagger: { id: 'serpent_fang_dagger', name: 'Snakefang' }, acidic_vial: { id: 'acidic_vial', name: 'Acidic Vial' }, cobra_scale_charm: { id: 'cobra_scale_charm', name: 'Cobra Charm' } } },
        safeHtml: (value) => value,
      },
    );

    expect(enemyPayload.theme.border).toContain('192,132,252');
    expect(enemyPayload.html).toContain('Wolf');
    expect(cardPayload.html).toContain('Judgement');
    expect(cardPayload.html).toContain('강화 사용 횟수');
    expect(cardPayload.html).toContain('강화 첫 발견');
    expect(cardPayload.html).toContain('해금 조건');
    expect(itemPayload.html).toContain('Snakefang');
    expect(itemPayload.html).toContain('독사의 시선');
    expect(itemPayload.html).toContain('해금 조건');
  });
});
