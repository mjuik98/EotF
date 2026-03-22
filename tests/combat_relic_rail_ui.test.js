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
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
  return doc;
}

describe('combat_relic_rail_ui', () => {
  it('defines desktop rail styles, open-state detail panel styles, and a 900px fallback', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('#combatOverlay.active #combatRelicRail');
    expect(source).toContain("#combatRelicPanel[data-open='true']");
    expect(source).toContain('@media (max-width: 900px)');
  });

  it('renders relic panel entries by combat priority, keeps panel state, and binds tooltip callbacks', () => {
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
          desc: '전투 시작 시: 카드 1장 추가 드로우',
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
    expect(combatRelicPanel.dataset.open).toBe('true');
    expect(combatRelicRailSlots.children[0].textContent).toBe('✧');
    expect(combatRelicRailSlots.children[1].textContent).toBe('◇');
    expect(combatRelicRailSlots.children[2].textContent).toBe('◯');
    expect(combatRelicRailSlots.children[3].textContent).toBe('◯');
    expect(combatRelicRailCount.parentNode).toBe(combatRelicRail);
    expect(combatRelicRailSlots.parentNode).toBe(combatRelicRail);
    expect(combatRelicPanel.parentNode).toBe(combatRelicRail);

    expect(combatRelicPanelList.children).toHaveLength(4);
    expect(combatRelicPanelList.children[0].textContent).toContain('전투 시작의 아뮬렛');
    expect(combatRelicPanelList.children[0].textContent).toContain('전투 시작 시: 카드 1장 추가 드로우');
    expect(combatRelicPanelList.children[1].textContent).toContain('전투 준비의 부적');
    expect(combatRelicPanelList.children[2].textContent).toContain('턴 종료의 반지');
    expect(combatRelicPanelList.children[3].textContent).toContain('평범한 반지');

    const topSlot = combatRelicRailSlots.children[0];
    topSlot.listeners.click();
    expect(combatRelicPanel.dataset.open).toBe('false');
    topSlot.listeners.click();
    expect(combatRelicPanel.dataset.open).toBe('true');

    const hoverEvent = { type: 'mouseenter', currentTarget: topSlot };
    topSlot.listeners.mouseenter(hoverEvent);
    expect(showItemTooltip).toHaveBeenCalledWith(hoverEvent, 'legendary_combat_start');

    topSlot.listeners.mouseleave({ type: 'mouseleave', currentTarget: topSlot });
    expect(hideItemTooltip).toHaveBeenCalledWith();

    combatRelicPanel.dataset.open = 'false';
    renderCombatRelicRail({ doc, gs, data, deps: { showItemTooltip, hideItemTooltip } });
    expect(combatRelicPanel.dataset.open).toBe('false');

    delete combatRelicPanel.dataset.open;
    renderCombatRelicRail({ doc, gs, data, deps: { showItemTooltip, hideItemTooltip } });
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
