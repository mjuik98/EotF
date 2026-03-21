import { describe, expect, it } from 'vitest';

import { updateHudPanels } from '../game/ui/hud/hud_panel_sections.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.disabled = false;
    this.title = '';

    this.classList = {
      _tokens: new Set(),
      add: (...tokens) => tokens.forEach((token) => this.classList._tokens.add(token)),
      remove: (...tokens) => tokens.forEach((token) => this.classList._tokens.delete(token)),
      contains: (token) => this.classList._tokens.has(token),
      toggle: (token, force) => {
        if (force === undefined) {
          if (this.classList._tokens.has(token)) {
            this.classList._tokens.delete(token);
            return false;
          }
          this.classList._tokens.add(token);
          return true;
        }
        if (force) this.classList._tokens.add(token);
        else this.classList._tokens.delete(token);
        return !!force;
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
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  querySelector(selector) {
    if (selector === '.kbd-hint') {
      return this.children.find((child) => child.className === 'kbd-hint') || null;
    }
    return null;
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
    querySelector() {
      return null;
    },
  };
  return doc;
}

function createState(overrides = {}) {
  const {
    player: playerOverrides = {},
    combat: combatOverrides = {},
    meta: metaOverrides = {},
    runConfig: runConfigOverrides = {},
    ...restOverrides
  } = overrides;

  return {
    player: {
      class: 'paladin',
      gold: 0,
      kills: 0,
      deck: [],
      hand: [],
      graveyard: [],
      exhausted: [],
      items: [],
      echo: 0,
      energy: 1,
      hp: 10,
      maxHp: 10,
      ...playerOverrides,
    },
    combat: {
      active: true,
      playerTurn: true,
      ...combatOverrides,
    },
    meta: {
      runCount: 1,
      inscriptions: {},
      ...metaOverrides,
    },
    runConfig: {
      curse: 'none',
      disabledInscriptions: [],
      ...runConfigOverrides,
    },
    currentRegion: 0,
    currentFloor: 1,
    ...restOverrides,
  };
}

function renderDrawButton(gsOverrides = {}) {
  const doc = createDoc();
  const drawBtn = doc.createElement('button');
  drawBtn.id = 'combatDrawCardBtn';

  updateHudPanels({
    gs: createState(gsOverrides),
    deps: {},
    doc,
    data: {
      classes: {
        paladin: { emoji: 'P', name: 'Paladin' },
      },
      items: {},
      inscriptions: {},
    },
    setText: () => {},
  });

  return drawBtn;
}

describe('updateHudPanels draw button state', () => {
  it('shows Turn Locked state during enemy turn', () => {
    const drawBtn = renderDrawButton({
      combat: { active: true, playerTurn: false },
      player: { energy: 3, hand: ['a'] },
    });

    expect(drawBtn.disabled).toBe(true);
    expect(drawBtn.textContent).toContain('적 턴');
    expect(drawBtn.title).toBe('적 턴에는 카드를 뽑을 수 없습니다.');
  });

  it('shows Hand Full state when the hand reaches the max size', () => {
    const drawBtn = renderDrawButton({
      player: { energy: 2, hand: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] },
    });

    expect(drawBtn.disabled).toBe(true);
    expect(drawBtn.classList.contains('hand-full')).toBe(true);
    expect(drawBtn.textContent).toContain('손패 가득 참');
    expect(drawBtn.title).toBe('손패가 가득 찼습니다 (최대 8장)');
  });

  it('shows No Energy state when the player turn is active but energy is missing', () => {
    const drawBtn = renderDrawButton({
      player: { energy: 0, hand: ['a'] },
    });

    expect(drawBtn.disabled).toBe(true);
    expect(drawBtn.classList.contains('hand-full')).toBe(false);
    expect(drawBtn.textContent).toContain('에너지 부족');
    expect(drawBtn.title).toBe('카드를 드로우하려면 에너지 1이 필요합니다.');
  });

  it('shows the normal draw CTA when drawing is available', () => {
    const drawBtn = renderDrawButton({
      player: { energy: 2, hand: ['a'] },
    });

    expect(drawBtn.disabled).toBe(false);
    expect(drawBtn.textContent).toContain('카드 드로우 (1 에너지)');
    expect(drawBtn.title).toBe('카드 1장을 드로우합니다 (에너지 1).');
  });
});
