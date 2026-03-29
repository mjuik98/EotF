import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildBottomDock,
  buildFloorBar,
  buildNextNodeCard,
  getRegionShortName,
  stripHtml,
} from '../game/features/run/presentation/browser/map_ui_next_nodes_render.js';

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
    expect(dock.children[0].children[0].children[1].textContent).toBe('No Rule');
    expect(dock.children[1].children[0].className).toContain('is-actionable');
  });

  it('renders deck and pause hints from the current input bindings instead of hardcoded keys', () => {
    const doc = createDoc();
    const dock = buildBottomDock(doc, { name: 'Region', rule: 'No Rule' }, {
      keybindings: {
        deckView: 'Tab',
        pause: 'KeyP',
      },
      nodeCount: 2,
      onShowFullMap: () => {},
      onToggleDeckView: () => {},
    });

    const bar = dock.children[1];
    const deckEntry = bar.children[2];
    const pauseEntry = bar.children[6];

    expect(deckEntry.children[0].textContent).toBe('Tab');
    expect(deckEntry.children[1].textContent).toBe('덱 보기');
    expect(pauseEntry.children[0].textContent).toBe('P');
    expect(pauseEntry.children[1].textContent).toBe('일시정지');
  });

  it('renders bottom dock region descriptions through the shared highlight path', () => {
    const doc = createDoc();
    const dock = buildBottomDock(doc, {
      name: 'Region',
      rule: 'No Rule',
      ruleDesc: '피해 14. [지역 규칙]',
    });

    const desc = dock.children[0].children[0].children[3];
    expect(desc.innerHTML).toContain('kw-dmg');
    expect(desc.innerHTML).toContain('kw-special kw-block');
  });

  it('builds a compact floor bar label', () => {
    const doc = createDoc();
    const bar = buildFloorBar(doc, {
      currentFloor: 1,
      mapNodes: [
        { floor: 1, visited: true, type: 'combat' },
        { floor: 2, visited: false, type: 'elite' },
      ],
    }, {
      name: '🌲 잔향의 숲',
      floors: 7,
    }, {
      combat: { icon: 'C' },
      elite: { icon: 'E' },
    });

    expect(bar.children[0].textContent).toBe('지역 진행');
  });

  it('builds a next-node card with reward markup and simplified route subtitle', () => {
    const doc = createDoc();
    const { card, rgb } = buildNextNodeCard(doc, {
      node: { id: '1-0', floor: 1, pos: 0, type: 'elite' },
      index: 1,
      meta: { icon: 'E', label: 'Elite', color: '#cc2244', desc: 'Fight harder enemies.' },
    });

    expect(card.dataset.nodeId).toBe('1-0');
    expect(card.dataset.cardIdx).toBe('1');
    expect(card.style['--node-rgb']).toBe('204, 34, 68');
    expect(rgb).toBe('204, 34, 68');
    expect(card.innerHTML).toContain('A 경로');
    expect(card.innerHTML).not.toContain('Region 1층');
    expect(card.innerHTML).toContain('위험도');
    expect(card.innerHTML).toContain('유물');
  });

  it('highlights node card descriptions with the shared keyword markup', () => {
    const doc = createDoc();
    const { card } = buildNextNodeCard(doc, {
      node: { id: '1-0', floor: 1, pos: 0, type: 'elite' },
      meta: { icon: 'E', label: 'Elite', color: '#cc2244', desc: '피해 14. 잔향 20 충전 [소진]' },
    });

    expect(card.innerHTML).toContain('kw-dmg');
    expect(card.innerHTML).toContain('kw-echo');
    expect(card.innerHTML).toContain('kw-exhaust kw-block');
  });

  it('keeps node card keyword colors aligned with readable comparison surfaces', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('.node-card-desc .kw-dmg');
    expect(source).toContain('.node-card-desc .kw-shield');
    expect(source).toContain('.node-card-desc .kw-echo');
    expect(source).toContain('.node-card-desc .kw-buff.kw-block');
  });
});
