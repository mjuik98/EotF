import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { updateNextNodesOverlay } from '../game/features/run/presentation/browser/map_ui_next_nodes.js';

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
    focus: vi.fn(() => {
      doc.activeElement = el;
    }),
    remove() {
      if (el.id) doc._elements.delete(el.id);
    },
    setAttribute: vi.fn(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 80 }),
    cloneNode: () => createElement(doc, tag),
    querySelectorAll(selector) {
      const results = [];
      const className = selector.startsWith('.') ? selector.slice(1) : '';
      const visit = (node) => {
        if (!node) return;
        const classTokens = String(node.className || '').split(/\s+/).filter(Boolean);
        if (className && classTokens.includes(className)) {
          results.push(node);
        }
        for (const child of node.children || []) visit(child);
      };
      visit(el);
      return results;
    },
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
    defaultView: {
      getComputedStyle: (el) => ({
        display: el?.style?.display || 'block',
        visibility: 'visible',
        opacity: el?.classList?.contains?.('active') ? '1' : '0',
        pointerEvents: el?.classList?.contains?.('active') ? 'auto' : 'none',
      }),
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

describe('map_ui_next_nodes overlay', () => {
  const previousRaf = globalThis.requestAnimationFrame;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.requestAnimationFrame = (cb) => {
      cb();
      return 1;
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.requestAnimationFrame = previousRaf;
  });

  it('uses injected moveToNode callback instead of global handlers', () => {
    const doc = createDoc();
    const moveToNode = vi.fn();

    updateNextNodesOverlay({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      moveToNode,
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
        combat: { color: '#ff4455', icon: 'C', label: 'Combat', desc: 'fight' },
      },
      getRegionData: () => ({ name: 'Region', rule: 'Rule' }),
      getFloorStatusText: () => '1F',
      data: { items: {} },
    });

    const overlay = doc.getElementById('nodeCardOverlay');
    expect(overlay.style.display).toBe('flex');
    const keyHandler = overlay._ncKey;
    keyHandler({ key: '1' });
    vi.advanceTimersByTime(800);
    expect(moveToNode).toHaveBeenCalledWith('n1');
  });

  it('focuses the first route card when the overlay opens so keyboard shortcuts are live immediately', () => {
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
        combat: { color: '#ff4455', icon: 'C', label: 'Combat', desc: 'fight' },
      },
      getRegionData: () => ({ name: 'Region', rule: 'Rule' }),
      getFloorStatusText: () => '1F',
      data: { items: {} },
    });

    const overlay = doc.getElementById('nodeCardOverlay');
    const firstCard = overlay.querySelectorAll('.node-card')[0];

    expect(firstCard.focus).toHaveBeenCalledTimes(1);
    expect(doc.activeElement).toBe(firstCard);
  });

  it('does not toggle deck view while the full-map overlay is visible', () => {
    const doc = createDoc();
    const fullMapOverlay = createElement(doc);
    fullMapOverlay.id = 'fullMapOverlay';
    fullMapOverlay.classList.add('active');

    const showDeckView = vi.fn();
    const closeDeckView = vi.fn();

    updateNextNodesOverlay({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      moveToNode: vi.fn(),
      showDeckView,
      closeDeckView,
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
        combat: { color: '#ff4455', icon: 'C', label: 'Combat', desc: 'fight' },
      },
      getRegionData: () => ({ name: 'Region', rule: 'Rule' }),
      getFloorStatusText: () => '1F',
      data: { items: {} },
    });

    const overlay = doc.getElementById('nodeCardOverlay');
    const keyHandler = overlay._ncKey;
    const event = { key: 'Tab', preventDefault: vi.fn() };

    keyHandler(event);

    expect(showDeckView).not.toHaveBeenCalled();
    expect(closeDeckView).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not open the full map while the codex modal is visible', () => {
    const doc = createDoc();
    const codexModal = createElement(doc);
    codexModal.id = 'codexModal';
    codexModal.classList.add('active');

    const showFullMap = vi.fn();

    updateNextNodesOverlay({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      moveToNode: vi.fn(),
      showDeckView: vi.fn(),
      closeDeckView: vi.fn(),
      showFullMap,
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
        combat: { color: '#ff4455', icon: 'C', label: 'Combat', desc: 'fight' },
      },
      getRegionData: () => ({ name: 'Region', rule: 'Rule' }),
      getFloorStatusText: () => '1F',
      data: { items: {} },
    });

    const overlay = doc.getElementById('nodeCardOverlay');
    const keyHandler = overlay._ncKey;
    const event = { key: 'M', preventDefault: vi.fn() };

    keyHandler(event);

    expect(showFullMap).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not toggle deck view while the help menu is visible', () => {
    const doc = createDoc();
    const helpMenu = createElement(doc);
    helpMenu.id = 'helpMenu';

    const showDeckView = vi.fn();
    const closeDeckView = vi.fn();

    updateNextNodesOverlay({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      moveToNode: vi.fn(),
      showDeckView,
      closeDeckView,
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
        combat: { color: '#ff4455', icon: 'C', label: 'Combat', desc: 'fight' },
      },
      getRegionData: () => ({ name: 'Region', rule: 'Rule' }),
      getFloorStatusText: () => '1F',
      data: { items: {} },
    });

    const overlay = doc.getElementById('nodeCardOverlay');
    const keyHandler = overlay._ncKey;
    const event = { key: 'Tab', preventDefault: vi.fn() };

    keyHandler(event);

    expect(showDeckView).not.toHaveBeenCalled();
    expect(closeDeckView).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not open the full map while the deck view is visible', () => {
    const doc = createDoc();
    const deckViewModal = createElement(doc);
    deckViewModal.id = 'deckViewModal';
    deckViewModal.classList.add('active');

    const showFullMap = vi.fn();

    updateNextNodesOverlay({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      moveToNode: vi.fn(),
      showDeckView: vi.fn(),
      closeDeckView: vi.fn(),
      showFullMap,
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
        combat: { color: '#ff4455', icon: 'C', label: 'Combat', desc: 'fight' },
      },
      getRegionData: () => ({ name: 'Region', rule: 'Rule' }),
      getFloorStatusText: () => '1F',
      data: { items: {} },
    });

    const overlay = doc.getElementById('nodeCardOverlay');
    const keyHandler = overlay._ncKey;
    const event = { key: 'M', preventDefault: vi.fn() };

    keyHandler(event);

    expect(showFullMap).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('opens pause when escape is pressed from the next-node overlay', () => {
    const doc = createDoc();
    const togglePause = vi.fn();

    updateNextNodesOverlay({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      moveToNode: vi.fn(),
      showDeckView: vi.fn(),
      closeDeckView: vi.fn(),
      showFullMap: vi.fn(),
      togglePause,
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
        combat: { color: '#ff4455', icon: 'C', label: 'Combat', desc: 'fight' },
      },
      getRegionData: () => ({ name: 'Region', rule: 'Rule' }),
      getFloorStatusText: () => '1F',
      data: { items: {} },
    });

    const overlay = doc.getElementById('nodeCardOverlay');
    const keyHandler = overlay._ncKey;
    const event = { key: 'Escape', preventDefault: vi.fn() };

    keyHandler(event);

    expect(togglePause).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('does not toggle deck view while the run settings modal is visible', () => {
    const doc = createDoc();
    const runSettingsModal = createElement(doc);
    runSettingsModal.id = 'runSettingsModal';
    runSettingsModal.classList.add('active');

    const showDeckView = vi.fn();
    const closeDeckView = vi.fn();

    updateNextNodesOverlay({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      moveToNode: vi.fn(),
      showDeckView,
      closeDeckView,
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
        combat: { color: '#ff4455', icon: 'C', label: 'Combat', desc: 'fight' },
      },
      getRegionData: () => ({ name: 'Region', rule: 'Rule' }),
      getFloorStatusText: () => '1F',
      data: { items: {} },
    });

    const overlay = doc.getElementById('nodeCardOverlay');
    const keyHandler = overlay._ncKey;
    const event = { key: 'Tab', preventDefault: vi.fn() };

    keyHandler(event);

    expect(showDeckView).not.toHaveBeenCalled();
    expect(closeDeckView).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
