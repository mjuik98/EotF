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
  it('renders relics sorted by rarity, preserves panel open state, and binds tooltip callbacks', () => {
    const doc = createDoc();
    const combatRelicRail = doc.createElement('div');
    combatRelicRail.id = 'combatRelicRail';
    const combatRelicRailCount = doc.createElement('span');
    combatRelicRailCount.id = 'combatRelicRailCount';
    const combatRelicRailSlots = doc.createElement('div');
    combatRelicRailSlots.id = 'combatRelicRailSlots';
    const combatRelicPanel = doc.createElement('div');
    combatRelicPanel.id = 'combatRelicPanel';
    combatRelicPanel.dataset.open = 'true';
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

    expect(combatRelicRailCount.textContent).toBe('3');
    expect(combatRelicRailSlots.children).toHaveLength(3);
    expect(combatRelicPanel.dataset.open).toBe('true');
    expect(combatRelicRailSlots.children[0].textContent).toBe('✧');
    expect(combatRelicRailSlots.children[1].textContent).toBe('◇');
    expect(combatRelicRailSlots.children[2].textContent).toBe('◯');
    expect(combatRelicRailCount.parentNode).toBe(combatRelicRail);
    expect(combatRelicRailSlots.parentNode).toBe(combatRelicRail);
    expect(combatRelicPanel.parentNode).toBe(combatRelicRail);

    const topSlot = combatRelicRailSlots.children[0];
    const hoverEvent = { type: 'mouseenter', currentTarget: topSlot };
    topSlot.listeners.mouseenter(hoverEvent);
    expect(showItemTooltip).toHaveBeenCalledWith(hoverEvent, 'legendary_amulet');

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
});
