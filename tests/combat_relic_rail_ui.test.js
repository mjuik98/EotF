import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { renderCombatRelicRail } from '../game/features/combat/presentation/browser/combat_relic_rail_ui.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this._textContent = '';
    this.className = '';
    this.dataset = {};
    this.style = {};
    this.listeners = {};
    this.contains = (node) => {
      if (node === this) return true;
      return this.children.some((child) => typeof child?.contains === 'function' && child.contains(node));
    };

    Object.defineProperty(this, 'textContent', {
      get: () => this._textContent,
      set: (value) => {
        this._textContent = value == null ? '' : String(value);
        if (this.children.length) {
          this.children.forEach((child) => {
            child.parentNode = null;
          });
          this.children = [];
        }
      },
    });

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
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  addEventListener(name, handler) {
    this.listeners[name] = handler;
  }
}

function createDoc() {
  const doc = {
    _elements: new Map(),
    listeners: {},
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
    addEventListener(name, handler) {
      this.listeners[name] = handler;
    },
    removeEventListener(name, handler) {
      if (this.listeners[name] === handler) delete this.listeners[name];
    },
  };
  return doc;
}

describe('combat_relic_rail_ui', () => {
  it('defines desktop rail styles, fixed panel classes, and a 900px fallback', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('#combatOverlay.active #combatRelicRail');
    expect(source).toContain('z-index: 320;');
    expect(source).toContain('width: fit-content;');
    expect(source).toContain('max-width: calc(100vw - 36px);');
    expect(source).not.toContain('width: min(252px, calc(100vw - 36px));');
    expect(source).toContain('#combatRelicRailCount {');
    expect(source).toContain('position: absolute;');
    expect(source).toContain('top: 7px;');
    expect(source).toContain('right: 9px;');
    expect(source).toContain('#combatRelicRailSlots {');
    expect(source).toContain('position: relative;');
    expect(source).toContain('padding: 6px 34px 6px 6px;');
    expect(source).toContain('border-radius: 12px;');
    expect(source).toContain('box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);');
    expect(source).toMatch(/\.nc-floating-hp-shell \.nc-hp-wrap \{[^}]*pointer-events:\s*none;/s);
    expect(source).toContain('#combatRelicPanel {');
    expect(source).toContain("#combatRelicPanel[data-open='true']");
    expect(source).toContain('#combatRelicRailSlots button:is(:hover, :focus-visible, [data-active=\'true\'])');
    expect(source).toContain('@media (max-width: 900px)');
  });

  it('opens a fixed detail panel on hover and focus without using floating tooltip callbacks', () => {
    const doc = createDoc();
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
    combatRelicPanel.dataset.open = 'true';
    combatRelicPanel.appendChild(combatRelicPanelList);
    combatRelicRail.append(combatRelicRailCount, combatRelicRailSlots, combatRelicPanel);

    doc.defaultView = {
      innerWidth: 1280,
      listeners: {},
      addEventListener(name, handler) {
        this.listeners[name] = handler;
      },
      removeEventListener(name, handler) {
        if (this.listeners[name] === handler) delete this.listeners[name];
      },
    };
    const showItemTooltip = vi.fn();
    const hideItemTooltip = vi.fn();
    const gs = {
      player: {
        items: ['common_turn_end', 'legendary_combat_start', 'uncommon_turn_end', 'common_card_play'],
      },
    };
    const data = {
      items: {
        common_turn_end: {
          id: 'common_turn_end',
          name: '턴 종료의 반지',
          icon: '◯',
          rarity: 'common',
          desc: '턴 종료 시: 손패 제한 +1',
          trigger: 'turn_end',
        },
        legendary_combat_start: {
          id: 'legendary_combat_start',
          name: '전투 시작의 아뮬렛',
          icon: '✧',
          rarity: 'legendary',
          desc: '전투 시작 시: 카드 1장 추가 드로우\n[세트: 시작의 각인]',
          trigger: 'combat_start',
        },
        uncommon_turn_end: {
          id: 'uncommon_turn_end',
          name: '전투 준비의 부적',
          icon: '◇',
          rarity: 'uncommon',
          desc: '턴 종료 시: 방어막 2 획득',
          trigger: ['turn_end', 'combat_end'],
        },
        common_card_play: {
          id: 'common_card_play',
          name: '평범한 반지',
          icon: '◯',
          rarity: 'common',
          desc: '카드 사용 시: 랜덤 강화',
          trigger: 'card_play',
        },
      },
    };

    renderCombatRelicRail({
      doc,
      gs,
      data,
      deps: {
        showItemTooltip,
        hideItemTooltip,
      },
    });

    expect(combatRelicRailCount.textContent).toBe('4');
    expect(combatRelicRailSlots.children).toHaveLength(4);
    expect(combatRelicPanel.dataset.open).toBe('false');
    expect(combatRelicRailSlots.children[0].textContent).toBe('✧');
    expect(combatRelicRailSlots.children[1].textContent).toBe('◇');
    expect(combatRelicRailSlots.children[2].textContent).toBe('◯');
    expect(combatRelicRailSlots.children[3].textContent).toBe('◯');
    expect(combatRelicRailSlots.children[0].title).toBe('전투 시작의 아뮬렛\n전투 시작 시: 카드 1장 추가 드로우');
    expect(combatRelicRailSlots.children[1].title).toBe('전투 준비의 부적\n턴 종료 시: 방어막 2 획득');
    expect(combatRelicRailCount.parentNode).toBe(combatRelicRail);
    expect(combatRelicRailSlots.parentNode).toBe(combatRelicRail);
    expect(combatRelicPanel.parentNode).toBe(combatRelicRail);

    expect(combatRelicPanelList.children).toHaveLength(0);

    const topSlot = combatRelicRailSlots.children[0];
    expect(topSlot.listeners.click).toBeTypeOf('function');

    const hoverEvent = { type: 'mouseenter', currentTarget: topSlot };
    topSlot.listeners.mouseenter(hoverEvent);
    expect(showItemTooltip).not.toHaveBeenCalled();
    expect(combatRelicPanel.dataset.open).toBe('true');
    expect(combatRelicPanel.dataset.pinned).toBe('false');
    expect(combatRelicPanelList.children.length).toBeGreaterThan(0);
    expect(combatRelicPanelList.children[0].className).toBe('crp-head');
    expect(combatRelicPanelList.children[0].children[0].textContent).toContain('전투 시작의 아뮬렛');
    expect(combatRelicPanelList.children[0].children[1].children[0].textContent).toContain('전설');
    expect(combatRelicPanelList.children[0].children[1].children[1].textContent).toContain('전투 시작 시');
    expect(combatRelicPanelList.children[1].textContent).toContain('카드 1장 추가 드로우');
    expect(topSlot.dataset.active).toBe('true');

    topSlot.listeners.mouseleave({ type: 'mouseleave', currentTarget: topSlot });
    expect(hideItemTooltip).not.toHaveBeenCalled();
    expect(combatRelicPanel.dataset.open).toBe('false');

    const focusEvent = { type: 'focus', currentTarget: topSlot };
    topSlot.listeners.focus(focusEvent);
    expect(combatRelicPanel.dataset.open).toBe('true');
    expect(combatRelicPanelList.children[0].children[0].textContent).toContain('전투 시작의 아뮬렛');

    topSlot.listeners.blur({ type: 'blur', currentTarget: topSlot });
    expect(combatRelicPanel.dataset.open).toBe('false');

    const pinEvent = { type: 'click', currentTarget: topSlot, preventDefault: vi.fn() };
    topSlot.listeners.click(pinEvent);
    expect(combatRelicPanel.dataset.open).toBe('true');
    expect(combatRelicPanel.dataset.pinned).toBe('true');
    expect(pinEvent.preventDefault).not.toHaveBeenCalled();

    topSlot.listeners.mouseleave({ type: 'mouseleave', currentTarget: topSlot });
    expect(combatRelicPanel.dataset.open).toBe('true');

    doc.listeners.pointerdown({ target: doc.createElement('div') });
    expect(combatRelicPanel.dataset.open).toBe('false');

    topSlot.listeners.click({ type: 'click', currentTarget: topSlot, preventDefault: vi.fn() });
    expect(combatRelicPanel.dataset.open).toBe('true');
    doc.defaultView.listeners.keydown({ key: 'Escape' });
    expect(combatRelicPanel.dataset.open).toBe('false');

    combatRelicPanel.dataset.open = 'false';
    renderCombatRelicRail({ doc, gs, data, deps: { showItemTooltip, hideItemTooltip } });
    expect(combatRelicPanel.dataset.open).toBe('false');

    delete combatRelicPanel.dataset.open;
    renderCombatRelicRail({ doc, gs, data, deps: { showItemTooltip, hideItemTooltip } });
    expect(combatRelicPanel.dataset.open).toBe('false');
  });

  it('toggles the fixed panel on tap for touch-capable viewports', () => {
    const doc = createDoc();
    doc.defaultView = {
      ontouchstart: vi.fn(),
      innerWidth: 640,
      listeners: {},
      addEventListener(name, handler) {
        this.listeners[name] = handler;
      },
      removeEventListener(name, handler) {
        if (this.listeners[name] === handler) delete this.listeners[name];
      },
    };
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

    renderCombatRelicRail({
      doc,
      gs: {
        player: {
          items: ['legendary_combat_start'],
        },
      },
      data: {
        items: {
          legendary_combat_start: {
            id: 'legendary_combat_start',
            name: '전투 시작의 아뮬렛',
            icon: '✧',
            rarity: 'legendary',
            desc: '전투 시작 시: 카드 1장 추가 드로우',
            trigger: 'combat_start',
          },
        },
      },
      deps: {
        showItemTooltip,
        hideItemTooltip,
      },
    });

    const topSlot = combatRelicRailSlots.children[0];
    const tapEvent = { type: 'click', currentTarget: topSlot, preventDefault: vi.fn() };
    topSlot.listeners.click(tapEvent);

    expect(tapEvent.preventDefault).toHaveBeenCalledWith();
    expect(showItemTooltip).not.toHaveBeenCalled();
    expect(hideItemTooltip).not.toHaveBeenCalled();
    expect(combatRelicPanel.dataset.open).toBe('true');
    expect(combatRelicPanel.dataset.pinned).toBe('true');
    expect(combatRelicPanelList.children[0].children[0].textContent).toContain('전투 시작의 아뮬렛');

    topSlot.listeners.click(tapEvent);
    expect(combatRelicPanel.dataset.open).toBe('false');
  });

  it('clears stale relic slot nodes before rerender', () => {
    const doc = createDoc();
    const combatRelicRail = doc.createElement('div');
    combatRelicRail.id = 'combatRelicRail';
    const combatRelicRailCount = doc.createElement('span');
    combatRelicRailCount.id = 'combatRelicRailCount';
    const combatRelicRailSlots = doc.createElement('div');
    combatRelicRailSlots.id = 'combatRelicRailSlots';
    const combatRelicPanel = doc.createElement('div');
    combatRelicPanel.id = 'combatRelicPanel';
    combatRelicRail.append(combatRelicRailCount, combatRelicRailSlots, combatRelicPanel);

    const showItemTooltip = vi.fn();
    const hideItemTooltip = vi.fn();
    const gs = {
      player: {
        items: ['common_ring', 'legendary_amulet', 'uncommon_pendant'],
      },
    };
    const data = {
      items: {
        common_ring: {
          id: 'common_ring',
          icon: '◯',
          rarity: 'common',
        },
        uncommon_pendant: {
          id: 'uncommon_pendant',
          icon: '◇',
          rarity: 'uncommon',
        },
        legendary_amulet: {
          id: 'legendary_amulet',
          icon: '✧',
          rarity: 'legendary',
        },
      },
    };

    renderCombatRelicRail({
      doc,
      gs,
      data,
      deps: {
        showItemTooltip,
        hideItemTooltip,
      },
    });

    expect(combatRelicRailSlots.children).toHaveLength(3);

    const updatedGs = {
      player: {
        items: ['uncommon_pendant'],
      },
    };
    renderCombatRelicRail({
      doc,
      gs: updatedGs,
      data,
      deps: {
        showItemTooltip,
        hideItemTooltip,
      },
    });

    expect(combatRelicRailSlots.children).toHaveLength(1);
    expect(combatRelicRailSlots.children[0].textContent).toBe('◇');
  });

  it('preserves existing combat relic panel shell when combatRelicPanelList is absent', () => {
    const doc = createDoc();
    const combatRelicRail = doc.createElement('div');
    combatRelicRail.id = 'combatRelicRail';
    const combatRelicRailCount = doc.createElement('span');
    combatRelicRailCount.id = 'combatRelicRailCount';
    const combatRelicRailSlots = doc.createElement('div');
    combatRelicRailSlots.id = 'combatRelicRailSlots';
    const combatRelicPanel = doc.createElement('div');
    combatRelicPanel.id = 'combatRelicPanel';
    const panelHeader = doc.createElement('div');
    panelHeader.textContent = 'Relic Detail';
    const panelFooter = doc.createElement('div');
    panelFooter.textContent = 'Panel Footer';
    combatRelicPanel.append(panelHeader, panelFooter);
    combatRelicRail.append(combatRelicRailCount, combatRelicRailSlots, combatRelicPanel);

    const gs = {
      player: {
        items: ['common_turn_end', 'legendary_combat_start'],
      },
    };
    const data = {
      items: {
        common_turn_end: {
          id: 'common_turn_end',
          name: '턴 종료의 반지',
          icon: '◯',
          rarity: 'common',
          desc: '턴 종료 시: 손패 제한 +1',
          trigger: 'turn_end',
        },
        legendary_combat_start: {
          id: 'legendary_combat_start',
          name: '전투 시작의 아뮬렛',
          icon: '✧',
          rarity: 'legendary',
          desc: '전투 시작 시: 카드 1장 추가 드로우',
          trigger: 'combat_start',
        },
      },
    };

    renderCombatRelicRail({
      doc,
      gs,
      data,
    });

    expect(combatRelicRailCount.textContent).toBe('2');
    expect(combatRelicRailSlots.children).toHaveLength(2);
    expect(combatRelicPanel.children).toHaveLength(2);
    expect(combatRelicPanel.children[0]).toBe(panelHeader);
    expect(combatRelicPanel.children[1]).toBe(panelFooter);

    renderCombatRelicRail({
      doc,
      gs,
      data,
    });

    expect(combatRelicPanel.children).toHaveLength(2);
    expect(combatRelicPanel.children[0]).toBe(panelHeader);
    expect(combatRelicPanel.children[1]).toBe(panelFooter);
  });
});
