import { describe, expect, it } from 'vitest';

import { updateCombatLog } from '../game/ui/combat/combat_hud_log_ui.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.scrollTop = 0;
    this.scrollHeight = 240;
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
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this._innerHTML = '';
    this.children = [];
  }

  get textContent() {
    if (this.children.length > 0) {
      return this.children.map((child) => child.textContent).join('');
    }
    return this._textContent;
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  removeChild(node) {
    const index = this.children.indexOf(node);
    if (index >= 0) {
      this.children.splice(index, 1);
      node.parentNode = null;
    }
    return node;
  }

  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  get firstChild() {
    return this.children[0] || null;
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

describe('combat_hud_log_ui', () => {
  it('renders new logs and scrolls when entries are appended', () => {
    const doc = createDoc();
    const container = doc.createElement('div');
    container.id = 'combatLog';

    const updated = updateCombatLog(doc, [
      { id: 'a', msg: 'Player attacks', type: 'attack' },
      { id: 'b', msg: 'Enemy is stunned', type: 'status' },
    ]);

    expect(updated).toBe(true);
    expect(container.children).toHaveLength(2);
    expect(container.children[0].dataset.logId).toBe('a');
    expect(container.children[1].className).toBe('log-entry status');
    expect(container.scrollTop).toBe(container.scrollHeight);
  });

  it('updates existing id-based entries, prunes stale nodes, and keeps recent limit', () => {
    const doc = createDoc();
    const container = doc.createElement('div');
    container.id = 'combatLog';

    updateCombatLog(doc, [
      { id: 'a', msg: 'Old A', type: 'attack' },
      { id: 'b', msg: 'Old B', type: 'status' },
    ]);
    container.scrollTop = 0;

    updateCombatLog(doc, [
      { id: 'b', msg: 'New B', type: 'heal' },
      { id: 'c', msg: 'New C', type: 'attack' },
    ]);

    expect(container.children).toHaveLength(2);
    expect(container.children[0].dataset.logId).toBe('b');
    expect(container.children[0].textContent).toBe('New B');
    expect(container.children[0].className).toBe('log-entry heal');
    expect(container.children[0].style.animation).toBe('none');
    expect(container.children[1].dataset.logId).toBe('c');
    expect(container.scrollTop).toBe(container.scrollHeight);
  });

  it('deduplicates id-less messages and clears the container when logs become empty', () => {
    const doc = createDoc();
    const container = doc.createElement('div');
    container.id = 'combatLog';

    updateCombatLog(doc, [
      { msg: 'Repeated line', type: 'info' },
      { msg: 'Repeated line', type: 'info' },
      { msg: 'Unique line', type: 'info' },
    ]);

    expect(container.children).toHaveLength(2);
    expect(container.children[0].textContent).toBe('Repeated line');
    expect(container.children[1].textContent).toBe('Unique line');

    updateCombatLog(doc, []);
    expect(container.children).toHaveLength(0);
    expect(container.textContent).toBe('');
  });
});
