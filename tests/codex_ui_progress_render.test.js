import { describe, expect, it, vi } from 'vitest';
import { renderCodexProgress } from '../game/features/codex/public.js';

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

  querySelectorAll(selector) {
    const results = [];
    if (!selector.startsWith('.')) return results;
    const token = selector.slice(1);
    const visit = (node) => {
      if (node.className.split(/\s+/).filter(Boolean).includes(token)) results.push(node);
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
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
  return doc;
}

describe('codex_ui_progress_render', () => {
  it('renders badges and ring summary markup', () => {
    const doc = createDoc();
    const section = doc.createElement('div');
    section.id = 'cxProgressSection';
    ['enemies', 'cards', 'items', 'inscriptions'].forEach((tab) => {
      const badge = doc.createElement('span');
      badge.id = `cxBadge_${tab}`;
    });
    const requestAnimationFrame = vi.fn((cb) => {
      cb();
      return 1;
    });

    renderCodexProgress(doc, {
      enemies: { seen: 1, total: 2 },
      cards: { seen: 2, total: 4 },
      items: { seen: 3, total: 5 },
      inscriptions: { seen: 1, total: 1 },
      percent: 58,
      circumference: 100,
      offset: 42,
    }, {
      requestAnimationFrame,
    });

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(doc.getElementById('cxBadge_cards').textContent).toBe('2/4');
    expect(section.innerHTML).toContain('58%');
    expect(section.innerHTML).toContain('stroke-dashoffset="42.0"');
  });
});
