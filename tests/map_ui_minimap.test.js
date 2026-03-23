import { describe, expect, it } from 'vitest';

import { renderMinimapUI } from '../game/features/run/public.js';

class MockContext2D {
  constructor() {
    this.fillStyle = '';
    this.strokeStyle = '';
    this.lineWidth = 0;
    this.shadowBlur = 0;
    this.shadowColor = '';
    this.globalAlpha = 1;
    this.font = '';
    this.textAlign = '';
    this.textBaseline = '';
  }

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
}

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.style = {};
    this.width = 0;
    this.height = 0;
    this._textContent = '';
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    if (node.id) this.ownerDocument._elements.set(node.id, node);
    return node;
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.width || 100, height: this.height || 100 };
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
  }

  get textContent() {
    return this._textContent;
  }
}

function createMockDocument() {
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

describe('map_ui_minimap', () => {
  it('renders minimap hover data and updates the hint on hover', () => {
    const doc = createMockDocument();
    const hint = doc.createElement('div');
    hint.id = 'minimapNodeHint';
    doc._elements.set('minimapNodeHint', hint);

    const canvas = doc.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    canvas.style = {};
    const ctx = new MockContext2D();

    renderMinimapUI({
      doc,
      minimapCanvas: canvas,
      minimapCtx: ctx,
      gs: {
        currentFloor: 0,
        currentNode: { id: '0-a' },
        mapNodes: [
          { id: '0-a', floor: 0, pos: 0, total: 1, type: 'combat', visited: false, accessible: true, children: ['1-a'] },
          { id: '1-a', floor: 1, pos: 0, total: 1, type: 'event', visited: false, accessible: true },
        ],
      },
      nodeMeta: {
        combat: { icon: 'C', label: 'Combat' },
        event: { icon: 'E', label: 'Event' },
      },
    });

    expect(canvas._minimapHoverData.entries).toHaveLength(1);
    expect(canvas._minimapHintEl).toBe(hint);
    expect(typeof canvas.listeners.mousemove).toBe('function');

    canvas.listeners.mousemove({
      clientX: 50,
      clientY: 90,
    });

    expect(canvas.style.cursor).toBe('pointer');
    expect(hint.textContent).toBe('C Combat - 0F');
    expect(hint.style.opacity).toBe('1');
  });

  it('clears an attached minimap hint when there is no drawable map data', () => {
    const canvas = {
      _minimapHintEl: { textContent: 'stale', style: { opacity: '1' } },
      _minimapNodeMeta: {},
    };

    renderMinimapUI({
      minimapCanvas: canvas,
      minimapCtx: new MockContext2D(),
      gs: { mapNodes: [] },
    });

    expect(canvas._minimapHintEl.textContent).toBe('');
    expect(canvas._minimapHintEl.style.opacity).toBe('0');
  });
});
