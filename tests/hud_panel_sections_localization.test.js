import { describe, expect, it, vi } from 'vitest';

import { updateHudPanels } from '../game/ui/hud/hud_panel_sections.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.textContent = '';
    this.onmouseenter = null;
    this.onmouseleave = null;

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

function register(doc, id, tagName = 'div') {
  const el = doc.createElement(tagName);
  el.id = id;
  return el;
}

function createState() {
  return {
    player: {
      class: 'unknown',
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
    },
    combat: {
      active: true,
      playerTurn: true,
    },
    meta: {
      runCount: 1,
      inscriptions: {},
    },
    runConfig: {
      curse: 'none',
      disabledInscriptions: [],
    },
    currentRegion: 999,
    currentFloor: 1,
  };
}

describe('hud_panel_sections localization', () => {
  it('does not render deprecated class special panels even when placeholder nodes exist', () => {
    const doc = createDoc();
    const setText = (id, value) => {
      const target = doc.getElementById(id);
      if (target) target.textContent = String(value);
    };

    [
      'playerAvatar',
      'playerPortraitFallback',
      'playerSpecialDisplay',
      'hoverHudSpecial',
      'regionName',
      'regionRule',
      'regionFloor',
      'playerFloor',
      'itemSlots',
      'setBonusPanel',
      'combatRelicRail',
      'combatRelicRailCount',
      'combatRelicRailSlots',
      'combatRelicPanel',
      'combatRelicPanelList',
      'hudRunModifiers',
      'useEchoSkillBtn',
      'combatDrawCardBtn',
      'hudGoldText',
      'runCount',
      'killCount',
      'goldCount',
      'deckCount',
      'graveCount',
      'deckSize',
      'graveyardSize',
      'exhaustSize',
      'combatDeckCount',
      'combatGraveCount',
      'combatExhaustCount',
      'playerNameDisplay',
      'playerClassDisplay',
    ].forEach((id) => register(doc, id, id.includes('Btn') ? 'button' : 'div'));

    const state = createState();
    state.player.class = 'swordsman';
    const getSpecialUI = vi.fn(() => 'deprecated special');

    updateHudPanels({
      gs: state,
      deps: {
        classMechanics: {
          swordsman: { getSpecialUI },
        },
        runRules: {
          getAscension: () => 0,
          isEndless: () => false,
          curses: {},
        },
      },
      doc,
      data: {
        classes: {
          swordsman: { emoji: '⚔️', name: '잔향검사' },
        },
        items: {},
        inscriptions: {},
      },
      setText,
    });

    expect(getSpecialUI).not.toHaveBeenCalled();
    expect(doc.getElementById('playerSpecialDisplay').textContent).toBe('');
    expect(doc.getElementById('hoverHudSpecial').textContent).toBe('');
    expect(doc.getElementById('playerNameDisplay').textContent).toBe('잔향검사');
    expect(doc.getElementById('playerClassDisplay').textContent).toBe('잔향검사');
  });

  it('renders Korean fallbacks for empty class special and unknown region tooltip', () => {
    const doc = createDoc();
    const setText = (id, value) => {
      const target = doc.getElementById(id);
      if (target) target.textContent = String(value);
    };

    [
      'playerAvatar',
      'playerPortraitFallback',
      'playerSpecialDisplay',
      'hoverHudSpecial',
      'regionName',
      'regionRule',
      'regionFloor',
      'playerFloor',
      'itemSlots',
      'setBonusPanel',
      'combatRelicRail',
      'combatRelicRailCount',
      'combatRelicRailSlots',
      'combatRelicPanel',
      'combatRelicPanelList',
      'hudRunModifiers',
      'useEchoSkillBtn',
      'combatDrawCardBtn',
      'hudGoldText',
      'runCount',
      'killCount',
      'goldCount',
      'deckCount',
      'graveCount',
      'deckSize',
      'graveyardSize',
      'exhaustSize',
      'combatDeckCount',
      'combatGraveCount',
      'combatExhaustCount',
      'playerNameDisplay',
      'playerClassDisplay',
    ].forEach((id) => register(doc, id, id.includes('Btn') ? 'button' : 'div'));

    const tooltipUI = {
      showGeneralTooltip: vi.fn(),
      hideGeneralTooltip: vi.fn(),
    };

    updateHudPanels({
      gs: createState(),
      deps: {
        tooltipUI,
        runRules: {
          getAscension: () => 0,
          isEndless: () => false,
          curses: {},
        },
      },
      doc,
      data: {
        classes: {},
        items: {},
        inscriptions: {},
      },
      setText,
    });

    expect(doc.getElementById('regionName').textContent).toBe('미확인 지역');
    expect(doc.getElementById('combatRelicRailCount').textContent).toBe('0');

    doc.getElementById('regionName').onmouseenter?.({ currentTarget: { getBoundingClientRect: () => ({ left: 0, right: 0, top: 0 }) } });

    expect(tooltipUI.showGeneralTooltip).toHaveBeenCalledWith(
      expect.any(Object),
      '미확인 지역 - -',
      '지역 규칙이 적용 중입니다.',
      expect.any(Object),
    );
  });
});
