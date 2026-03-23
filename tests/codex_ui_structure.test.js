import { describe, expect, it, vi } from 'vitest';

import {
  buildCodexModalMarkup,
  injectCodexModalStructure,
  setCodexTabState,
} from '../game/features/codex/public.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.dataset = {};
    this.listeners = {};
    this._innerHTML = '';
    this._value = '';

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
      toggle: (token, force) => {
        const has = this.className.split(/\s+/).filter(Boolean).includes(token);
        const shouldAdd = force === undefined ? !has : !!force;
        if (shouldAdd) this.classList.add(token);
        else this.classList.remove(token);
        return shouldAdd;
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

    Object.defineProperty(this, 'value', {
      get: () => this._value,
      set: (value) => {
        this._value = String(value ?? '');
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

  querySelector(selector) {
    if (!selector.startsWith('.')) return null;
    const token = selector.slice(1);
    const visit = (node) => {
      if (node.className.split(/\s+/).filter(Boolean).includes(token)) return node;
      for (const child of node.children) {
        const found = visit(child);
        if (found) return found;
      }
      return null;
    };
    return visit(this);
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

describe('codex_ui_structure', () => {
  it('builds modal markup with expected anchors', () => {
    const markup = buildCodexModalMarkup();
    expect(markup).toContain('id="cxSearch"');
    expect(markup).toContain('id="codexContent"');
    expect(markup).toContain('id="codexTab_items"');
  });

  it('injects structure once and wires events', () => {
    const doc = createDoc();
    const modal = doc.createElement('div');
    modal.id = 'codexModal';
    const inner = doc.createElement('div');
    inner.className = 'codex-modal-inner';
    modal.appendChild(inner);

    const search = doc.createElement('input');
    search.id = 'cxSearch';
    const sort = doc.createElement('select');
    sort.id = 'cxSort';
    const close = doc.createElement('button');
    close.id = 'codexCloseBtn';
    const tab = doc.createElement('button');
    tab.id = 'codexTab_cards';
    modal.appendChild(search);
    modal.appendChild(sort);
    modal.appendChild(close);
    modal.appendChild(tab);

    const onSearchChange = vi.fn();
    const onSortChange = vi.fn();
    const onClose = vi.fn();
    const onTabSelect = vi.fn();

    injectCodexModalStructure(doc, { onSearchChange, onSortChange, onClose, onTabSelect });
    injectCodexModalStructure(doc, { onSearchChange, onSortChange, onClose, onTabSelect });

    expect(inner.dataset.v3).toBe('1');
    search.listeners.input[0]({ target: { value: 'wolf' } });
    sort.listeners.change[0]({ target: { value: 'name' } });
    close.listeners.click[0]();
    tab.listeners.click[0]();

    expect(onSearchChange).toHaveBeenCalledWith('wolf');
    expect(onSortChange).toHaveBeenCalledWith('name');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onTabSelect).toHaveBeenCalledWith('cards');
  });

  it('toggles tab active state', () => {
    const doc = createDoc();
    ['enemies', 'cards', 'items', 'inscriptions'].forEach((tab) => {
      const button = doc.createElement('button');
      button.id = `codexTab_${tab}`;
      doc._elements.set(button.id, button);
    });

    setCodexTabState(doc, 'items');

    expect(doc.getElementById('codexTab_items').classList.contains('active')).toBe(true);
    expect(doc.getElementById('codexTab_cards').classList.contains('active')).toBe(false);
  });
});
