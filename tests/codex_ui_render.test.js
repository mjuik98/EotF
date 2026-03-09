import { describe, expect, it, vi } from 'vitest';

import {
  createCodexCardEntry,
  renderCodexFilterBar,
  renderCodexProgress,
  renderCodexSection,
} from '../game/ui/screens/codex_ui_render.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.dataset = {};
    this.style = {};
    this.listeners = {};
    this._innerHTML = '';
    this._textContent = '';

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

    Object.defineProperty(this, 'textContent', {
      get: () => this._textContent,
      set: (value) => {
        this._textContent = String(value ?? '');
        this._innerHTML = '';
        this.children = [];
      },
    });
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }

  querySelectorAll(selector) {
    const results = [];
    if (!selector.startsWith('.')) return results;
    const token = selector.slice(1);
    const visit = (node) => {
      if (node.className.split(/\s+/).filter(Boolean).includes(token)) {
        results.push(node);
      }
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return results;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
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

describe('codex_ui_render', () => {
  it('renders progress badges and ring summary', () => {
    const doc = createDoc();
    const section = doc.createElement('div');
    section.id = 'cxProgressSection';
    doc.body.appendChild(section);
    ['enemies', 'cards', 'items', 'inscriptions'].forEach((tab) => {
      const badge = doc.createElement('span');
      badge.id = `cxBadge_${tab}`;
      doc.body.appendChild(badge);
    });
    const onSelectTab = vi.fn();
    const originalRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = (cb) => {
      cb();
      return 1;
    };

    try {
      renderCodexProgress(doc, {
        enemies: { seen: 1, total: 2 },
        cards: { seen: 2, total: 4 },
        items: { seen: 3, total: 5 },
        inscriptions: { seen: 1, total: 1 },
        percent: 58,
        circumference: 100,
        offset: 42,
      }, { onSelectTab });

      expect(doc.getElementById('cxBadge_cards').textContent).toBe('2/4');
      expect(section.innerHTML).toContain('58%');
      expect(section.innerHTML).toContain('stroke-dashoffset="42.0"');
    } finally {
      globalThis.requestAnimationFrame = originalRaf;
    }
  });

  it('renders filter bar and wires filter handlers', () => {
    const doc = createDoc();
    const bar = doc.createElement('div');
    bar.id = 'cxFilterBar';
    doc.body.appendChild(bar);
    const onFilterChange = vi.fn();
    const onToggleUnknown = vi.fn();

    renderCodexFilterBar(doc, {
      definitions: [{ k: 'all', l: '전체' }, { k: 'boss', l: '보스', c: 'f-boss' }],
      filter: 'boss',
      showUnknown: false,
      onFilterChange,
      onToggleUnknown,
    });

    const buttons = bar.children.filter((child) => child.tagName === 'BUTTON');
    buttons[0].listeners.click[0]();
    buttons[2].listeners.click[0]();

    expect(buttons[1].className).toContain('f-boss');
    expect(onFilterChange).toHaveBeenCalledWith('all');
    expect(onToggleUnknown).toHaveBeenCalledTimes(1);
  });

  it('renders sections and card entries via helper builders', () => {
    const doc = createDoc();
    const container = doc.createElement('div');
    const card = createCodexCardEntry(doc, {
      id: 'strike',
      name: 'Strike',
      type: 'ATTACK',
      rarity: 'common',
      cost: 1,
      icon: '⚔',
    }, 0, {
      gs: {
        meta: {
          codex: { enemies: new Set(), cards: new Set(['strike']), items: new Set() },
          codexRecords: { cards: { strike: { used: 7 } } },
        },
      },
      onOpen: vi.fn(),
    });

    renderCodexSection(doc, container, {
      title: '공격 카드',
      icon: '⚔️',
      entries: [{ id: 'strike' }],
      seenCount: 1,
      buildCard: () => card,
    });

    expect(container.children[0].innerHTML).toContain('1 / 1');
    expect(card.innerHTML).toContain('Strike');
    expect(card.innerHTML).toContain('✦ 7');
  });
});
