import { describe, expect, it, vi } from 'vitest';

import {
  applyChronicleFilter,
  closeBattleChronicleOverlay,
  openBattleChronicleOverlay,
} from '../game/ui/combat/combat_hud_chronicle_runtime_ui.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.dataset = {};
    this.listeners = {};
    this.style = {};
    this.scrollTop = 0;
    this.scrollHeight = 240;
    this.clientHeight = 120;
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
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this.children = [];
  }

  get textContent() {
    return this._textContent;
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

  querySelectorAll(selector) {
    const results = [];
    const match = (node) => {
      if (selector.startsWith('.')) {
        const classPart = selector.match(/^\.([^\[\s]+)/)?.[1];
        if (classPart && !node.className.split(/\s+/).filter(Boolean).includes(classPart)) return false;
        const attrMatch = selector.match(/\[data-filter="([^"]+)"\]/);
        if (attrMatch && node.dataset.filter !== attrMatch[1]) return false;
        return true;
      }
      if (selector.startsWith('#')) return node.id === selector.slice(1);
      return false;
    };
    const visit = (node) => {
      if (match(node)) results.push(node);
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return results;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  closest(selector) {
    if (!selector.startsWith('.')) return null;
    const className = selector.slice(1);
    let current = this;
    while (current) {
      if (current.className.split(/\s+/).filter(Boolean).includes(className)) return current;
      current = current.parentNode;
    }
    return null;
  }
}

function createDoc() {
  const doc = {
    _elements: new Map(),
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
  return doc;
}

function createChronicleDoc() {
  const doc = createDoc();
  const overlay = doc.createElement('div');
  overlay.id = 'battleChronicleOverlay';
  const panel = doc.createElement('div');
  panel.className = 'battle-chronicle-panel';
  const list = doc.createElement('div');
  list.id = 'battleChronicleList';
  panel.appendChild(list);
  overlay.appendChild(panel);

  const filterBar = doc.createElement('div');
  filterBar.id = 'chronicleFilterBar';
  const all = doc.createElement('button');
  all.className = 'chronicle-filter-btn';
  all.dataset.filter = 'all';
  const support = doc.createElement('button');
  support.className = 'chronicle-filter-btn';
  support.dataset.filter = 'support';
  filterBar.appendChild(all);
  filterBar.appendChild(support);

  return { doc, overlay, panel, list, filterBar, all, support };
}

describe('combat_hud_chronicle_runtime_ui', () => {
  it('opens the chronicle overlay and binds filters/wheel handlers', () => {
    const { doc, overlay, panel, list, filterBar, all, support } = createChronicleDoc();
    const frame = vi.fn((callback) => callback());

    openBattleChronicleOverlay(doc, [
      { turn: 1, msg: '적에게 5 피해', type: 'action' },
      { turn: 1, msg: '2 회복', type: 'heal' },
      { turn: 2, msg: '방어막 +3', type: 'shield' },
    ], { requestAnimationFrame: frame });

    expect(overlay.style.display).toBe('flex');
    expect(overlay.classList.contains('active')).toBe(true);
    expect(list.children).toHaveLength(2);
    expect(all.classList.contains('active')).toBe(true);
    expect(filterBar.dataset.bound).toBe('1');
    expect(panel._wheelAbort).toBeTruthy();
    expect(list.scrollTop).toBe(list.scrollHeight);

    filterBar.listeners.click[0]({ target: support });

    expect(support.classList.contains('active')).toBe(true);
    expect(list.children[0].style.display).toBe('');
    expect(list.children[1].style.display).toBe('');
    expect(list.children[0].children[2].style.display).toBe('none');
  });

  it('applies category filters and closes the overlay cleanly', () => {
    const { doc, overlay, panel, list } = createChronicleDoc();
    panel._wheelAbort = { abort: vi.fn() };

    openBattleChronicleOverlay(doc, [
      { turn: 1, msg: '적에게 5 피해', type: 'action' },
      { turn: 1, msg: '방어막 +3', type: 'shield' },
    ], { requestAnimationFrame: (callback) => callback() });

    applyChronicleFilter(list, 'support');
    expect(list.children[0].children[2].style.display).toBe('none');
    expect(list.children[0].children[3].style.display).toBe('');

    closeBattleChronicleOverlay(doc);

    expect(panel._wheelAbort).toBeNull();
    expect(overlay.style.display).toBe('none');
    expect(overlay.classList.contains('active')).toBe(false);
  });
});
