import { describe, expect, it, vi } from 'vitest';

import {
  updateActionButtons,
  updateItemPanels,
  updateRunModifierPanel,
} from '../game/ui/hud/hud_panel_runtime_helpers.js';

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
    this.listeners = {};

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

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  addEventListener(name, handler) {
    this.listeners[name] = handler;
  }

  setAttribute(name, value) {
    this[name] = String(value);
  }

  querySelector(selector) {
    if (selector === '.action-btn-end') {
      return this.ownerDocument._actionBtnEnd || null;
    }
    return null;
  }
}

function createDoc() {
  const doc = {
    _elements: new Map(),
    _actionBtnEnd: null,
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
    querySelector(selector) {
      if (selector === '.action-btn-end') return this._actionBtnEnd;
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
      hand: [],
      items: [],
      echo: 0,
      energy: 1,
      ...playerOverrides,
    },
    combat: {
      active: true,
      playerTurn: true,
      ...combatOverrides,
    },
    meta: {
      inscriptions: {},
      ...metaOverrides,
    },
    runConfig: {
      curse: 'none',
      disabledInscriptions: [],
      ...runConfigOverrides,
    },
    ...restOverrides,
  };
}

describe('hud_panel_runtime_helpers', () => {
  it('renders empty items and active set bonuses', () => {
    const doc = createDoc();
    const itemSlots = doc.createElement('div');
    itemSlots.id = 'itemSlots';
    const setBonusPanel = doc.createElement('div');
    setBonusPanel.id = 'setBonusPanel';

    updateItemPanels({
      gs: createState(),
      deps: {
        setBonusSystem: {
          getActiveSets: () => [{ name: 'Echo Set', count: 2, bonus: { label: 'Glow' } }],
          applyPassiveBonuses: vi.fn(),
        },
      },
      doc,
      data: { items: {} },
    });

    expect(itemSlots.children[0].textContent).toBe('비어 있음');
    expect(setBonusPanel.style.display).toBe('block');
    expect(setBonusPanel.children[0].children[0].textContent).toBe('Echo Set [2/3]');
  });

  it('keeps hud item tooltip wiring while the combat relic rail uses the fixed detail panel', () => {
    const doc = createDoc();
    const itemSlots = doc.createElement('div');
    itemSlots.id = 'itemSlots';
    const setBonusPanel = doc.createElement('div');
    setBonusPanel.id = 'setBonusPanel';
    const combatRelicRail = doc.createElement('div');
    combatRelicRail.id = 'combatRelicRail';
    const combatRelicRailCount = doc.createElement('span');
    combatRelicRailCount.id = 'combatRelicRailCount';
    const combatRelicRailSlots = doc.createElement('div');
    combatRelicRailSlots.id = 'combatRelicRailSlots';
    const combatRelicPanel = doc.createElement('div');
    combatRelicPanel.id = 'combatRelicPanel';
    const combatRelicPanelList = doc.createElement('div');
    combatRelicPanelList.id = 'combatRelicPanelList';
    combatRelicPanel.appendChild(combatRelicPanelList);
    combatRelicRail.append(combatRelicRailCount, combatRelicRailSlots, combatRelicPanel);

    const showItemTooltip = vi.fn();
    const hideItemTooltip = vi.fn();
    const preloadTooltipModules = vi.fn();

    updateItemPanels({
      gs: createState({
        player: {
          items: ['common_relic', 'legendary_relic'],
        },
      }),
      deps: {
        setBonusSystem: {
          getActiveSets: () => [],
          applyPassiveBonuses: vi.fn(),
        },
        showItemTooltip,
        hideItemTooltip,
        tooltipUI: {
          preloadTooltipModules,
        },
      },
      doc,
      data: {
        items: {
          common_relic: {
            id: 'common_relic',
            icon: '◯',
            rarity: 'common',
            name: '보통 유물',
            desc: '기본 설명',
          },
          legendary_relic: {
            id: 'legendary_relic',
            icon: '✧',
            rarity: 'legendary',
            name: '전설 유물',
            desc: '강한 설명\n[세트: 전설 연계]',
          },
        },
      },
    });

    expect(itemSlots.children).toHaveLength(2);
    expect(itemSlots.children[0].title).toBe('전설 유물\n강한 설명');
    expect(itemSlots.children[1].title).toBe('보통 유물\n기본 설명');
    expect(combatRelicRailCount.textContent).toBe('2');
    expect(combatRelicRailSlots.children).toHaveLength(2);
    expect(combatRelicRailSlots.children[0].textContent).toBe('✧');
    expect(combatRelicRailSlots.children[1].textContent).toBe('◯');
    expect(combatRelicRailSlots.children[0].title || '').toBe('');
    expect(combatRelicRailSlots.children[1].title || '').toBe('');
    expect(combatRelicRailSlots.children[0]['aria-label']).toBe('전설 유물\n강한 설명');
    expect(combatRelicRailSlots.children[1]['aria-label']).toBe('보통 유물\n기본 설명');
    expect(preloadTooltipModules).toHaveBeenCalledTimes(1);
    expect(combatRelicPanelList.children).toHaveLength(0);
    expect(combatRelicPanel.dataset.open).toBe('false');

    const hudHoverEvent = { type: 'mouseenter', currentTarget: itemSlots.children[0] };
    itemSlots.children[0].listeners.mouseenter(hudHoverEvent);
    expect(showItemTooltip).toHaveBeenCalledWith(hudHoverEvent, 'legendary_relic');

    itemSlots.children[0].listeners.mouseleave({ type: 'mouseleave', currentTarget: itemSlots.children[0] });
    expect(hideItemTooltip).toHaveBeenCalledWith();

    const railHoverEvent = { type: 'mouseenter', currentTarget: combatRelicRailSlots.children[0] };
    combatRelicRailSlots.children[0].listeners.mouseenter(railHoverEvent);
    expect(combatRelicPanel.dataset.open).toBe('true');
    expect(combatRelicPanelList.children.length).toBeGreaterThan(0);
    expect(combatRelicPanelList.children[0].children[0].textContent).toContain('전설 유물');
    expect(showItemTooltip).toHaveBeenCalledTimes(1);
  });

  it('prefers TooltipUI item handlers over proxy callbacks for hud slots while the rail uses the fixed panel', () => {
    const doc = createDoc();
    const itemSlots = doc.createElement('div');
    itemSlots.id = 'itemSlots';
    const setBonusPanel = doc.createElement('div');
    setBonusPanel.id = 'setBonusPanel';
    const combatRelicRail = doc.createElement('div');
    combatRelicRail.id = 'combatRelicRail';
    const combatRelicRailCount = doc.createElement('span');
    combatRelicRailCount.id = 'combatRelicRailCount';
    const combatRelicRailSlots = doc.createElement('div');
    combatRelicRailSlots.id = 'combatRelicRailSlots';
    const combatRelicPanel = doc.createElement('div');
    combatRelicPanel.id = 'combatRelicPanel';
    const combatRelicPanelList = doc.createElement('div');
    combatRelicPanelList.id = 'combatRelicPanelList';
    combatRelicPanel.appendChild(combatRelicPanelList);
    combatRelicRail.append(combatRelicRailCount, combatRelicRailSlots, combatRelicPanel);

    const showItemTooltip = vi.fn();
    const hideItemTooltip = vi.fn();
    const tooltipUI = {
      showItemTooltip: vi.fn(),
      hideItemTooltip: vi.fn(),
    };

    updateItemPanels({
      gs: createState({
        player: {
          items: ['legendary_relic'],
        },
      }),
      deps: {
        setBonusSystem: {
          getActiveSets: () => [],
          applyPassiveBonuses: vi.fn(),
        },
        showItemTooltip,
        hideItemTooltip,
        tooltipUI,
      },
      doc,
      data: {
        items: {
          legendary_relic: {
            id: 'legendary_relic',
            icon: '✧',
            rarity: 'legendary',
            name: '전설 유물',
            desc: '강한 설명',
          },
        },
      },
    });

    const hoverEvent = { type: 'mouseenter', currentTarget: itemSlots.children[0] };
    itemSlots.children[0].listeners.mouseenter(hoverEvent);
    expect(tooltipUI.showItemTooltip).toHaveBeenCalledWith(hoverEvent, 'legendary_relic', expect.any(Object));
    expect(showItemTooltip).not.toHaveBeenCalled();

    itemSlots.children[0].listeners.mouseleave({ type: 'mouseleave', currentTarget: itemSlots.children[0] });
    expect(tooltipUI.hideItemTooltip).toHaveBeenCalledWith(expect.any(Object));
    expect(hideItemTooltip).not.toHaveBeenCalled();

    combatRelicRailSlots.children[0].listeners.mouseenter({ type: 'mouseenter', currentTarget: combatRelicRailSlots.children[0] });
    expect(combatRelicPanel.dataset.open).toBe('true');
    expect(combatRelicPanelList.children[0].children[0].textContent).toContain('전설 유물');
  });

  it('renders run modifiers with inscriptions and curse info', () => {
    const doc = createDoc();
    const modEl = doc.createElement('div');
    modEl.id = 'hudRunModifiers';

    updateRunModifierPanel({
      gs: createState({
        meta: { inscriptions: { alpha: 1, beta: 2 } },
        runConfig: { curse: 'doom', disabledInscriptions: ['beta'] },
      }),
      deps: {
        data: { inscriptions: { alpha: { name: 'Alpha' }, beta: { name: 'Beta' } } },
        runRules: {
          getAscension: () => 3,
          isEndless: () => true,
          curses: { doom: { name: 'Doom', desc: 'desc' } },
        },
      },
      doc,
    });

    expect(modEl.children).toHaveLength(2);
    expect(modEl.children[0].children[0].textContent).toBe('승천 3');
    expect(modEl.children[0].children[1].textContent).toBe('무한 모드');
    expect(modEl.children[1].children[0].textContent).toContain('각인 1: Alpha');
    expect(modEl.children[1].children[1].textContent).toBe('Doom');
  });

  it('updates end-turn warning and echo button state', () => {
    const doc = createDoc();
    const endBtn = doc.createElement('button');
    doc._actionBtnEnd = endBtn;
    const echoBtn = doc.createElement('button');
    echoBtn.id = 'useEchoSkillBtn';
    const drawBtn = doc.createElement('button');
    drawBtn.id = 'combatDrawCardBtn';

    updateActionButtons({
      gs: createState({
        player: {
          hand: ['strike'],
          echo: 45,
          energy: 2,
        },
      }),
      deps: {},
      doc,
      data: {
        cards: {
          strike: { cost: 1 },
        },
      },
    });

    expect(endBtn.classList.contains('energy-warn')).toBe(true);
    expect(echoBtn.disabled).toBe(false);
    expect(echoBtn.textContent).toContain('잔향 스킬');
    expect(echoBtn.textContent).toContain('45/60');
    expect(drawBtn.disabled).toBe(false);
  });
});
