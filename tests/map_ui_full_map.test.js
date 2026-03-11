import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { showFullMapOverlay } from '../game/ui/map/map_ui_full_map.js';

class MockContext2D {
  clearRect() {}
  fillRect() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  arc() {}
  fill() {}
  setLineDash() {}
  fillText() {}
  save() {}
  restore() {}
}

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.style = {};
    this.className = '';
    this.scrollTop = 0;
    this.width = 0;
    this.height = 0;
    this._textContent = '';
    this._innerHTML = '';
  }

  append(...nodes) {
    nodes.forEach(node => this.appendChild(node));
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    if (node.id) this.ownerDocument._elements.set(node.id, node);
    return node;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter(child => child !== this);
      this.parentNode = null;
    }
    if (this.id) this.ownerDocument._elements.delete(this.id);
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 240, height: 80 };
  }

  getContext() {
    return new MockContext2D();
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this.children = [];
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

function createMockDocument() {
  const doc = {
    _elements: new Map(),
    _listeners: {},
    body: null,
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
    addEventListener(type, handler) {
      if (!this._listeners[type]) this._listeners[type] = [];
      this._listeners[type].push(handler);
    },
    removeEventListener(type, handler) {
      this._listeners[type] = (this._listeners[type] || []).filter(cb => cb !== handler);
    },
  };
  doc.body = new MockElement(doc, 'body');
  return doc;
}

describe('map_ui_full_map', () => {
  it('creates the full-map overlay and closes it on Escape', () => {
    const doc = createMockDocument();
    const requestAnimationFrame = vi.fn(() => 11);
    const cancelAnimationFrame = vi.fn();
    showFullMapOverlay({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      requestAnimationFrame,
      cancelAnimationFrame,
      gs: {
        currentRegion: 0,
        currentFloor: 1,
        currentNode: { id: '2-a' },
        mapNodes: [
          { id: '1-a', floor: 1, pos: 0, total: 1, type: 'combat', visited: true, accessible: true, children: ['2-a'] },
          { id: '2-a', floor: 2, pos: 0, total: 1, type: 'event', visited: false, accessible: true },
        ],
      },
      nodeMeta: {
        combat: { icon: 'C', label: 'Combat', color: '#ff4455', desc: 'Fight enemies.' },
        event: { icon: 'E', label: 'Event', color: '#33ccff', desc: 'Resolve an event.' },
      },
      getRegionData: () => ({ name: 'Region Zero' }),
    });

    const overlay = doc.getElementById('fullMapOverlay');
    expect(overlay).toBeTruthy();
    expect(typeof overlay._closeFullMap).toBe('function');
    expect(doc.body.children.includes(overlay)).toBe(true);
    expect(requestAnimationFrame).toHaveBeenCalled();
    expect((doc._listeners.keydown || [])).toHaveLength(1);

    const onKeyDown = doc._listeners.keydown[0];
    onKeyDown({
      key: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    });

    expect(cancelAnimationFrame).toHaveBeenCalledWith(11);
    expect(doc.getElementById('fullMapOverlay')).toBeNull();
  });

  it('toggles off an existing full-map overlay on repeated invocation', () => {
    const doc = createMockDocument();
    const deps = {
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      requestAnimationFrame: vi.fn(() => 11),
      cancelAnimationFrame: vi.fn(),
      gs: {
        currentRegion: 0,
        currentFloor: 0,
        currentNode: null,
        mapNodes: [
          { id: '1-a', floor: 1, pos: 0, total: 1, type: 'combat', visited: false, accessible: true },
        ],
      },
      nodeMeta: {
        combat: { icon: 'C', label: 'Combat', color: '#ff4455', desc: 'Fight enemies.' },
      },
      getRegionData: () => ({ name: 'Region Zero' }),
    };

    showFullMapOverlay(deps);
    expect(doc.getElementById('fullMapOverlay')).toBeTruthy();

    showFullMapOverlay(deps);
    expect(doc.getElementById('fullMapOverlay')).toBeNull();
  });
});
