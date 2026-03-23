import { describe, expect, it, vi } from 'vitest';
import { HudUpdateUI } from '../game/ui/hud/hud_update_ui.js';
import { initDepsFactory } from '../game/core/deps_factory.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this.dataset = {};
    this._textContent = '';

    this.classList = {
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.add(token));
        this.className = [...next].join(' ');
      },
      remove: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.delete(token));
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
        this.children = [];
      },
    });
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    if (!node) return node;
    if (node.parentNode) {
      node.parentNode.children = node.parentNode.children.filter((child) => child !== node);
    }
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
      this.parentNode = null;
    }
    if (this.id) this.ownerDocument._elements.delete(this.id);
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
    querySelector() {
      return null;
    },
  };
  doc.body = new MockElement(doc, 'body');
  return doc;
}

describe('HudUpdateUI.updatePlayerStats', () => {
  it('refreshes the floating hp panel after shield changes from damage', () => {
    const doc = createMockDocument();
    const gs = {
      currentScreen: 'combat',
      combat: { active: true },
      player: {
        hp: 42,
        maxHp: 100,
        shield: 12,
        echo: 0,
        maxEcho: 100,
        buffs: {},
      },
    };

    HudUpdateUI.updatePlayerStats(gs, { doc });
    let shell = doc.getElementById('ncFloatingHpShell');
    expect(shell).not.toBeNull();
    expect(shell.querySelectorAll('.nc-hp-shield-bar-fill')).toHaveLength(1);

    gs.player.shield = 0;
    HudUpdateUI.updatePlayerStats(gs, { doc });
    shell = doc.getElementById('ncFloatingHpShell');
    expect(shell.querySelectorAll('.nc-hp-shield-bar-fill')).toHaveLength(0);
  });

  it('self-resolves hud update deps for floating status badges when callers omit deps', () => {
    const doc = createMockDocument();
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    const updateStatusDisplay = vi.fn(({ doc: renderDoc, statusContainerId }) => {
      const container = renderDoc.getElementById(statusContainerId);
      const badge = renderDoc.createElement('span');
      badge.className = 'hud-status-badge';
      badge.dataset.buffKey = 'unbreakable_wall';
      container?.appendChild(badge);
    });
    const gs = {
      currentScreen: 'combat',
      combat: { active: true },
      player: {
        hp: 42,
        maxHp: 100,
        shield: 12,
        echo: 0,
        maxEcho: 100,
        buffs: { unbreakable_wall: { stacks: 99 } },
      },
    };

    globalThis.document = doc;
    globalThis.window = { innerWidth: 1280, innerHeight: 720 };
    initDepsFactory({
      GAME: { getDeps: () => ({ doc, win: globalThis.window }) },
      StatusEffectsUI: { updateStatusDisplay, getStatusMap: () => ({}) },
      TooltipUI: {},
      _gameStarted: () => true,
    });

    try {
      HudUpdateUI.updatePlayerStats(gs);
    } finally {
      globalThis.document = originalDocument;
      globalThis.window = originalWindow;
      initDepsFactory({});
    }

    const shell = doc.getElementById('ncFloatingHpShell');
    expect(shell).not.toBeNull();
    expect(updateStatusDisplay).toHaveBeenCalled();
    expect(shell.querySelectorAll('.hud-status-badge')).toHaveLength(1);
  });
});

describe('HudUpdateUI.doUpdateUI', () => {
  it('hydrates contract deps before scheduling a full HUD refresh', () => {
    const doc = createMockDocument();
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    let scheduledRefresh = null;
    const updateStatusDisplay = vi.fn(({ doc: renderDoc, statusContainerId }) => {
      const container = renderDoc.getElementById(statusContainerId);
      const badge = renderDoc.createElement('span');
      badge.className = 'hud-status-badge';
      badge.dataset.buffKey = 'resonance';
      container?.appendChild(badge);
    });
    const gs = {
      meta: { runCount: 1, inscriptions: {} },
      runConfig: { curse: 'none', disabledInscriptions: [] },
      currentScreen: 'combat',
      currentRegion: 0,
      currentFloor: 1,
      combat: { active: true, playerTurn: true },
      clearDirtyFlag: vi.fn(),
      player: {
        class: 'swordsman',
        hp: 42,
        maxHp: 100,
        shield: 0,
        echo: 0,
        maxEcho: 100,
        gold: 0,
        kills: 0,
        energy: 3,
        maxEnergy: 3,
        hand: [],
        deck: [],
        graveyard: [],
        exhausted: [],
        items: [],
        buffs: { resonance: { stacks: 99, dmgBonus: 1 } },
      },
    };

    globalThis.document = doc;
    globalThis.window = {
      innerWidth: 1280,
      innerHeight: 720,
      requestAnimationFrame: vi.fn((cb) => {
        scheduledRefresh = cb;
        return 1;
      }),
    };
    initDepsFactory({
      GAME: { getDeps: () => ({ doc, win: globalThis.window }) },
      StatusEffectsUI: { updateStatusDisplay, getStatusMap: () => ({}) },
      TooltipUI: {},
      _gameStarted: () => true,
    });

    try {
      HudUpdateUI.updateUI({
        gs,
        data: { classes: {}, items: {}, inscriptions: {} },
        runRules: { getAscension: () => 0, isEndless: () => false },
      });

      expect(globalThis.window.requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(updateStatusDisplay).not.toHaveBeenCalled();
      expect(scheduledRefresh).toEqual(expect.any(Function));

      scheduledRefresh();
    } finally {
      globalThis.document = originalDocument;
      globalThis.window = originalWindow;
      initDepsFactory({});
    }

    const shell = doc.getElementById('ncFloatingHpShell');
    expect(shell).not.toBeNull();
    expect(updateStatusDisplay).toHaveBeenCalled();
    expect(shell.querySelectorAll('.hud-status-badge')).toHaveLength(1);
  });

  it('hydrates floating hp panel status badges from contract deps during full HUD refresh', () => {
    const doc = createMockDocument();
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    const updateStatusDisplay = vi.fn(({ doc: renderDoc, statusContainerId }) => {
      const container = renderDoc.getElementById(statusContainerId);
      const badge = renderDoc.createElement('span');
      badge.className = 'hud-status-badge';
      badge.dataset.buffKey = 'resonance';
      container?.appendChild(badge);
    });
    const gs = {
      meta: { runCount: 1, inscriptions: {} },
      runConfig: { curse: 'none', disabledInscriptions: [] },
      currentScreen: 'combat',
      currentRegion: 0,
      currentFloor: 1,
      combat: { active: true, playerTurn: true },
      clearDirtyFlag: vi.fn(),
      player: {
        class: 'swordsman',
        hp: 42,
        maxHp: 100,
        shield: 0,
        echo: 0,
        maxEcho: 100,
        gold: 0,
        kills: 0,
        energy: 3,
        maxEnergy: 3,
        hand: [],
        deck: [],
        graveyard: [],
        exhausted: [],
        items: [],
        buffs: { resonance: { stacks: 99, dmgBonus: 1 } },
      },
    };

    globalThis.document = doc;
    globalThis.window = { innerWidth: 1280, innerHeight: 720 };
    initDepsFactory({
      GAME: { getDeps: () => ({ doc, win: globalThis.window }) },
      StatusEffectsUI: { updateStatusDisplay, getStatusMap: () => ({}) },
      TooltipUI: {},
      _gameStarted: () => true,
    });

    try {
      HudUpdateUI.doUpdateUI({
        gs,
        data: { classes: {}, items: {}, inscriptions: {} },
        runRules: { getAscension: () => 0, isEndless: () => false },
      });
    } finally {
      globalThis.document = originalDocument;
      globalThis.window = originalWindow;
      initDepsFactory({});
    }

    const shell = doc.getElementById('ncFloatingHpShell');
    expect(shell).not.toBeNull();
    expect(updateStatusDisplay).toHaveBeenCalled();
    expect(shell.querySelectorAll('.hud-status-badge')).toHaveLength(1);
  });

  it('still refreshes status badges when optional run modifier HUD is missing', () => {
    const doc = createMockDocument();
    const updateStatusDisplay = vi.fn();
    const gs = {
      meta: { runCount: 1, inscriptions: {} },
      runConfig: { curse: 'none', disabledInscriptions: [] },
      currentRegion: 0,
      currentFloor: 1,
      combat: { active: true, playerTurn: true },
      clearDirtyFlag: vi.fn(),
      player: {
        class: 'guardian',
        hp: 42,
        maxHp: 100,
        shield: 12,
        echo: 0,
        maxEcho: 100,
        gold: 0,
        kills: 0,
        energy: 3,
        maxEnergy: 3,
        hand: [],
        deck: [],
        graveyard: [],
        exhausted: [],
        items: [],
        buffs: { unbreakable_wall: { stacks: 99 } },
      },
    };

    HudUpdateUI.doUpdateUI({
      doc,
      gs,
      data: { classes: {}, items: {}, inscriptions: {} },
      runRules: { getAscension: () => 0, isEndless: () => false },
      updateStatusDisplay,
    });

    expect(doc.getElementById('ncFloatingHpShell')).not.toBeNull();
    expect(updateStatusDisplay).toHaveBeenCalledTimes(1);
  });
});
