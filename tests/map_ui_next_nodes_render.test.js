import { describe, expect, it } from 'vitest';

import {
  buildBottomDock,
  buildNextNodeCard,
  getRegionShortName,
  stripHtml,
} from '../game/ui/map/map_ui_next_nodes_render.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.className = '';
    this.dataset = {};
    this.listeners = {};
    this.style = { setProperty: (key, value) => { this.style[key] = value; } };
    this._innerHTML = '';
    this._textContent = '';
    this.classList = {
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.add(token));
        this.className = [...next].join(' ');
      },
    };
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    this.children.push(node);
    node.parentNode = this;
    return node;
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }

  setAttribute(name, value) {
    this[name] = String(value);
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
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

function createDoc() {
  return {
    createElement(tagName) {
      return new MockElement(this, tagName);
    },
  };
}

describe('map_ui_next_nodes_render', () => {
  it('normalizes region labels and strips markup', () => {
    expect(getRegionShortName('🌌 Abyss')).toBe('Abyss');
    expect(stripHtml('<b>Hello</b> <i>World</i>', 20)).toBe('Hello World');
  });

  it('builds the bottom dock and actionable key rows', () => {
    const doc = createDoc();
    const dock = buildBottomDock(doc, { name: 'Region', rule: 'No Rule' }, {
      nodeCount: 2,
      onShowFullMap: () => {},
      onToggleDeckView: () => {},
    });

    expect(dock.id).toBe('ncBottomDock');
    expect(dock.children).toHaveLength(2);
    expect(dock.children[1].children[0].className).toContain('is-actionable');
  });

  it('builds a next-node card with reward and danger markup', () => {
    const doc = createDoc();
    const { card, rgb } = buildNextNodeCard(doc, {
      node: { id: '1-0', floor: 1, pos: 0, type: 'elite' },
      index: 1,
      meta: { icon: 'E', label: 'Elite', color: '#cc2244', desc: 'Fight harder enemies.' },
      shortRegionName: 'Region',
    });

    expect(card.dataset.nodeId).toBe('1-0');
    expect(card.dataset.cardIdx).toBe('1');
    expect(card.style['--node-rgb']).toBe('204, 34, 68');
    expect(rgb).toBe('204, 34, 68');
    expect(card.innerHTML).toContain('위험도');
    expect(card.innerHTML).toContain('유물');
  });
});
