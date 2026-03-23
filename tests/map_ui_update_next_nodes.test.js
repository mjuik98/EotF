import { describe, expect, it, vi } from 'vitest';
import { MapUI } from '../game/features/run/public.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.dataset = {};
    this.listeners = {};
    this._textContent = '';
    this._innerHTML = '';
    this.style = {
      setProperty: (key, value) => {
        this.style[key] = value;
      },
    };
    this.classList = {
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach(token => next.add(token));
        this.className = [...next].join(' ');
      },
      remove: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach(token => next.delete(token));
        this.className = [...next].join(' ');
      },
      contains: (token) => this.className.split(/\s+/).filter(Boolean).includes(token),
      toggle: (token, force) => {
        const hasToken = this.className.split(/\s+/).filter(Boolean).includes(token);
        const shouldAdd = force === undefined ? !hasToken : !!force;
        if (shouldAdd) this.classList.add(token);
        else this.classList.remove(token);
        return shouldAdd;
      },
    };

    Object.defineProperty(this, 'id', {
      get: () => this._id || '',
      set: (value) => {
        if (this._id) this.ownerDocument._elements.delete(this._id);
        this._id = value;
        if (value) this.ownerDocument._elements.set(value, this);
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

    Object.defineProperty(this, 'innerHTML', {
      get: () => this._innerHTML,
      set: (value) => {
        this._innerHTML = String(value ?? '');
        this._textContent = '';
      },
    });
  }

  get firstChild() {
    return this.children[0] || null;
  }

  append(...nodes) {
    nodes.forEach(node => this.appendChild(node));
  }

  appendChild(node) {
    if (!node) return node;
    if (node.parentNode) {
      node.parentNode.children = node.parentNode.children.filter(child => child !== node);
    }
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  insertBefore(node, referenceNode) {
    if (!referenceNode || !this.children.includes(referenceNode)) {
      return this.appendChild(node);
    }
    if (node.parentNode) {
      node.parentNode.children = node.parentNode.children.filter(child => child !== node);
    }
    node.parentNode = this;
    const index = this.children.indexOf(referenceNode);
    this.children.splice(index, 0, node);
    return node;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter(child => child !== this);
      this.parentNode = null;
    }
    if (this.id) {
      this.ownerDocument._elements.delete(this.id);
    }
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }

  setAttribute(name, value) {
    this[name] = String(value);
  }

  getAttribute(name) {
    return this[name] ?? null;
  }

  querySelectorAll(selector) {
    if (!selector.startsWith('.')) return [];
    const classToken = selector.slice(1);
    const result = [];
    const visit = (node) => {
      if (node.className.split(/\s+/).filter(Boolean).includes(classToken)) {
        result.push(node);
      }
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return result;
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 228, height: 320 };
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

function createOverlay(doc) {
  const overlay = doc.createElement('div');
  overlay.id = 'nodeCardOverlay';
  const title = doc.createElement('div');
  title.id = 'nodeCardTitle';
  const row = doc.createElement('div');
  row.id = 'nodeCardRow';
  overlay.append(title, row);
  doc.body.appendChild(overlay);
  return { overlay, title, row };
}

describe('MapUI.updateNextNodes', () => {
  it('renders the redesigned node overlay with cards and relic panel', () => {
    const doc = createMockDocument();
    const { overlay, title, row } = createOverlay(doc);
    const gs = {
      currentScreen: 'game',
      currentRegion: 0,
      currentFloor: 0,
      currentNode: null,
      combat: { active: false },
      player: { items: ['test_relic'] },
      mapNodes: [
        { id: '1-0', floor: 1, pos: 0, total: 2, type: 'combat', accessible: true, visited: false },
        { id: '1-1', floor: 1, pos: 1, total: 2, type: 'event', accessible: true, visited: false },
      ],
    };

    MapUI.updateNextNodes({
      gs,
      doc,
      data: {
        items: {
          test_relic: {
            name: 'Test Relic',
            icon: '*',
            rarity: 'rare',
            desc: 'Gain a bonus when combat starts.',
            trigger: 'combat_start',
          },
        },
      },
      nodeMeta: {
        combat: { icon: 'C', label: 'Combat', color: '#cc2244', desc: 'Fight enemies.' },
        event: { icon: '?', label: 'Event', color: '#0099cc', desc: 'Resolve an event.' },
      },
      getRegionData: () => ({
        name: 'Region Zero',
        rule: 'No Rule',
        floors: 7,
        accent: '#228855',
      }),
      getFloorStatusText: () => '1F',
    });

    const cardCount = row.children.filter(child => child.className.includes('node-card')).length;

    expect(overlay.style.display).toBe('flex');
    expect(overlay.style.flexDirection).toBe('row');
    expect(overlay.style.alignItems).toBe('stretch');
    expect(overlay.style.pointerEvents).toBe('auto');
    expect(title.style.display).toBe('none');
    expect(cardCount).toBe(2);
    expect(overlay._ncKey).toBeTypeOf('function');
    expect(overlay.children.some(child => child.id === 'ncRelicPanel')).toBe(true);
    expect(overlay.children.some(child => child.id === 'ncMainArea')).toBe(true);
  });

  it('uses a stable region fallback accent when region data does not define one', () => {
    const doc = createMockDocument();
    const { overlay } = createOverlay(doc);
    const gs = {
      currentScreen: 'game',
      currentRegion: 0,
      currentFloor: 0,
      currentNode: null,
      combat: { active: false },
      player: { hp: 10, maxHp: 10, items: [], deck: [], graveyard: [], exhausted: [] },
      mapNodes: [
        { id: '1-0', floor: 1, pos: 0, total: 2, type: 'combat', accessible: true, visited: false },
        { id: '1-1', floor: 1, pos: 1, total: 2, type: 'event', accessible: true, visited: false },
      ],
    };

    MapUI.updateNextNodes({
      gs,
      doc,
      data: { items: {} },
      nodeMeta: {
        combat: { icon: 'C', label: 'Combat', color: '#cc2244', desc: 'Fight enemies.' },
        event: { icon: '?', label: 'Event', color: '#0099cc', desc: 'Resolve an event.' },
      },
      getRegionData: () => ({
        name: 'Region Zero',
        rule: '기본 규칙',
        floors: 7,
      }),
      getFloorStatusText: () => '1F',
    });

    expect(overlay.style['--nc-accent']).toBe('#7b2fff');
    expect(overlay.style['--nc-accent']).not.toBe('#cc2244');
  });

  it('applies hp danger styling to the overlay', () => {
    const doc = createMockDocument();
    const { overlay } = createOverlay(doc);
    const gs = {
      currentScreen: 'game',
      currentRegion: 0,
      currentFloor: 0,
      currentNode: null,
      combat: { active: false },
      player: {
        hp: 28,
        maxHp: 100,
        shield: 12,
        buffs: { vulnerable: 1 },
        items: [],
      },
      mapNodes: [
        { id: '1-0', floor: 1, pos: 0, total: 1, type: 'combat', accessible: true, visited: false },
      ],
    };

    MapUI.updateNextNodes({
      gs,
      doc,
      data: { items: {} },
      nodeMeta: {
        combat: { icon: 'C', label: 'Combat', color: '#cc2244', desc: 'Fight enemies.' },
      },
      getRegionData: () => ({
        name: 'Region Zero',
        rule: 'No Rule',
        floors: 7,
        accent: '#228855',
      }),
      getFloorStatusText: () => '1F',
    });

    expect(overlay.classList.contains('nc-danger-low')).toBe(true);
    expect(overlay.classList.contains('nc-danger-critical')).toBe(false);
  });

  it('hides the overlay when movement is locked', () => {
    const doc = createMockDocument();
    const { overlay } = createOverlay(doc);
    overlay.style.display = 'flex';
    overlay.style.pointerEvents = 'auto';
    overlay.classList.add('nc-danger-low');

    MapUI.updateNextNodes({
      gs: {
        currentScreen: 'game',
        currentRegion: 0,
        currentFloor: 0,
        currentNode: null,
        combat: { active: false },
        _nodeMoveLock: true,
        player: { items: [] },
        mapNodes: [
          { id: '1-0', floor: 1, pos: 0, total: 1, type: 'combat', accessible: true, visited: false },
        ],
      },
      doc,
      data: { items: {} },
      nodeMeta: {
        combat: { icon: 'C', label: 'Combat', color: '#cc2244', desc: 'Fight enemies.' },
      },
    });

    expect(overlay.style.display).toBe('none');
    expect(overlay.style.pointerEvents).toBe('none');
    expect(overlay.classList.contains('nc-danger-low')).toBe(false);
  });
});
