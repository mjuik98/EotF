import { describe, expect, it, vi } from 'vitest';

import { updateNextNodesOverlay } from '../game/ui/map/map_ui_next_nodes.js';

function createElement(doc, tag = 'div') {
  const el = {
    ownerDocument: doc,
    tagName: tag.toUpperCase(),
    children: [],
    style: {
      setProperty: vi.fn(),
    },
    dataset: {},
    className: '',
    textContent: '',
    innerHTML: '',
    parentNode: null,
    listeners: {},
    classList: {
      _tokens: new Set(),
      add: (...tokens) => tokens.forEach((token) => el.classList._tokens.add(token)),
      remove: (...tokens) => tokens.forEach((token) => el.classList._tokens.delete(token)),
      contains: (token) => el.classList._tokens.has(token),
      toggle: vi.fn(),
    },
    append: (...nodes) => nodes.forEach((node) => el.appendChild(node)),
    appendChild(node) {
      if (!node) return node;
      node.parentNode = el;
      el.children.push(node);
      if (node.id) doc._elements.set(node.id, node);
      return node;
    },
    insertBefore(node) {
      return el.appendChild(node);
    },
    addEventListener(type, handler) {
      el.listeners[type] = handler;
    },
    remove() {
      if (el.id) doc._elements.delete(el.id);
    },
    setAttribute: vi.fn(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 80 }),
  };
  Object.defineProperty(el, 'id', {
    get: () => el._id || '',
    set: (value) => {
      el._id = value;
      if (value) doc._elements.set(value, el);
    },
  });
  return el;
}

function createDoc() {
  const doc = {
    _elements: new Map(),
    body: null,
    createElement(tag) {
      return createElement(doc, tag);
    },
    getElementById(id) {
      return doc._elements.get(id) || null;
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  doc.body = createElement(doc, 'body');
  const overlay = createElement(doc);
  overlay.id = 'nodeCardOverlay';
  doc._elements.set('nodeCardOverlay', overlay);
  return doc;
}

function findByClassName(root, className) {
  if (!root) return null;
  if (String(root.className || '').split(/\s+/).includes(className)) return root;
  for (const child of root.children || []) {
    const found = findByClassName(child, className);
    if (found) return found;
  }
  return null;
}

describe('map_ui_next_nodes region tag', () => {
  it('shows only the region name in the tag chip without duplicate rule tooltip bindings', () => {
    const doc = createDoc();

    updateNextNodesOverlay({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      moveToNode: vi.fn(),
      showDeckView: vi.fn(),
      closeDeckView: vi.fn(),
      showFullMap: vi.fn(),
      gs: {
        currentScreen: 'game',
        currentRegion: 0,
        currentFloor: 1,
        combat: { active: false },
        _nodeMoveLock: false,
        _rewardLock: false,
        _endCombatScheduled: false,
        _endCombatRunning: false,
        player: { hp: 10, maxHp: 10, items: [], deck: [], graveyard: [], exhausted: [] },
        mapNodes: [
          { id: 'n1', floor: 2, accessible: true, visited: false, type: 'combat' },
        ],
      },
      nodeMeta: {
        combat: { color: '#44aa66', icon: 'C', label: 'Combat', desc: 'fight' },
      },
      getRegionData: () => ({ name: '🌲 잔향의 숲', rule: '기본 규칙' }),
      getFloorStatusText: () => '잔향의 숲 · 첫걸음',
      data: { items: {} },
    });

    const overlay = doc.getElementById('nodeCardOverlay');
    const regionTag = findByClassName(overlay, 'nc-region-tag');

    expect(regionTag).toBeTruthy();
    expect(regionTag.children[1].textContent).toBe('잔향의 숲');
    expect(regionTag.listeners.mouseenter).toBeUndefined();
    expect(regionTag.listeners.focus).toBeUndefined();
  });
});
