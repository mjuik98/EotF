import { describe, expect, it } from 'vitest';

import {
  createFullMapLayout,
  createFullMapScene,
  findClosestNodeEntry,
  updateFullMapTooltip,
} from '../game/ui/map/map_ui_full_map_render.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.className = '';
    this.width = 0;
    this.height = 0;
    this._textContent = '';
    this._innerHTML = '';
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    if (node.id) this.ownerDocument._elements.set(node.id, node);
    return node;
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 160, height: 80 };
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

describe('map_ui_full_map_render', () => {
  it('creates a scene only for visible floors', () => {
    const gs = {
      currentFloor: 2,
      currentNode: { id: '2-a' },
      mapNodes: [
        { id: '1-a', floor: 1, pos: 0, total: 1, visited: true },
        { id: '2-a', floor: 2, pos: 0, total: 1, visited: false },
        { id: '4-a', floor: 4, pos: 0, total: 1, visited: false },
      ],
    };

    const scene = createFullMapScene(gs, 640, 500, 60);

    expect(scene.nodeEntries.map((entry) => entry.node.id)).toEqual(['1-a', '2-a']);
    expect(scene.visibleNodeIds.has('4-a')).toBe(false);
  });

  it('builds the overlay layout with legend entries', () => {
    const doc = createMockDocument();

    const refs = createFullMapLayout(doc, {
      ch: 420,
      cw: 640,
      nodeMeta: {
        combat: { icon: 'C', label: 'Combat', color: '#f44' },
        event: { icon: 'E', label: 'Event', color: '#4cf' },
      },
      onClose: () => {},
      titleText: 'Region - 2F',
    });

    expect(refs.overlay.id).toBe('fullMapOverlay');
    expect(refs.legend.children).toHaveLength(2);
    expect(refs.closeBtn.innerHTML).toContain('ESC');
    expect(refs.canvas.width).toBe(640);
    expect(refs.glitchCanvas.height).toBe(420);
  });

  it('positions tooltips inside the viewport and hides them when cleared', () => {
    const doc = createMockDocument();
    const refs = createFullMapLayout(doc, {
      ch: 420,
      cw: 640,
      nodeMeta: {},
      onClose: () => {},
      titleText: 'Region - 2F',
    });

    updateFullMapTooltip(
      refs,
      { type: 'combat', floor: 3, visited: false, accessible: true },
      { clientX: 390, clientY: 290 },
      { combat: { icon: 'C', label: 'Combat', color: '#f44', desc: 'Fight.' } },
      { innerWidth: 420, innerHeight: 320 },
    );

    expect(refs.tooltip.style.opacity).toBe('1');
    expect(refs.tooltipTitle.textContent).toBe('C Combat');
    expect(refs.tooltipStatus.textContent).toBe('3F - Reachable');
    expect(refs.tooltip.style.left).toBe('210px');
    expect(refs.tooltip.style.top).toBe('190px');

    updateFullMapTooltip(refs, null, null, {});
    expect(refs.tooltip.style.opacity).toBe('0');
  });

  it('finds the nearest entry within the hover threshold', () => {
    const closest = findClosestNodeEntry([
      { node: { id: 'a' }, x: 100, y: 100 },
      { node: { id: 'b' }, x: 200, y: 200 },
    ], 105, 110, 20);

    expect(closest?.node?.id).toBe('a');
    expect(findClosestNodeEntry([], 0, 0, 20)).toBeNull();
  });
});
