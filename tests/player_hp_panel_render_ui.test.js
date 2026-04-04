import { describe, expect, it, vi } from 'vitest';

import {
  buildFloatingPlayerHpPanel,
  getPlayerHpPanelLevel,
} from '../game/shared/ui/player_hp_panel/public.js';

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
    node.parentNode = this;
    this.children.push(node);
    return node;
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
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
  return doc;
}

describe('player_hp_panel_render_ui', () => {
  it('classifies hp levels consistently', () => {
    expect(getPlayerHpPanelLevel({ player: { hp: 18, maxHp: 100 } })).toBe('critical');
    expect(getPlayerHpPanelLevel({ player: { hp: 28, maxHp: 100 } })).toBe('low');
    expect(getPlayerHpPanelLevel({ player: { hp: 50, maxHp: 100 } })).toBe('mid');
    expect(getPlayerHpPanelLevel({ player: { hp: 80, maxHp: 100 } })).toBe('safe');
  });

  it('renders danger, shield, and status sections', () => {
    const doc = createMockDocument();
    const updateStatusDisplay = vi.fn();
    const wrap = buildFloatingPlayerHpPanel(doc, {
      player: { hp: 18, maxHp: 100, shield: 12 },
    }, { doc }, {
      panelId: 'ncFloatingHpPanel',
      statusContainerId: 'ncFloatingHpStatusBadges',
      statusEffectsUI: { updateStatusDisplay },
    });

    expect(wrap.querySelectorAll('.nc-hp-danger-banner')).toHaveLength(1);
    expect(wrap.querySelectorAll('.nc-hp-shield-bar-fill')).toHaveLength(1);
    expect(wrap.querySelectorAll('.nc-hp-status-badges')).toHaveLength(1);
    expect(wrap.children[0].children[0].children[0].textContent).toBe('체력');
    expect(wrap.children[0].children[0].children[1].textContent).toBe('위험');
    expect(wrap.children[1].children[1].children[1].children[0].textContent).toBe('보호막');
    expect(wrap.children[1].children[1].children[1].children[1].children[1].textContent).toBe('다음 피격까지');
    expect(wrap.children[3].children[2].textContent).toBe('즉시 회복 권장');
    expect(wrap.children[4].children[0].textContent).toBe('상태 효과');
    expect(updateStatusDisplay).toHaveBeenCalledWith({
      doc,
      gs: { player: { hp: 18, maxHp: 100, shield: 12 } },
      statusContainerId: 'ncFloatingHpStatusBadges',
    });
  });

  it('renders a fallback badge row when StatusEffectsUI is unavailable', () => {
    const doc = createMockDocument();
    const wrap = buildFloatingPlayerHpPanel(doc, {
      player: { hp: 80, maxHp: 100, shield: 0 },
    }, {}, {
      statusContainerId: 'ncFloatingHpStatusBadges',
    });

    expect(wrap.querySelectorAll('.nc-hp-status-badges')).toHaveLength(1);
    expect(wrap.querySelectorAll('.nc-hp-danger-banner')).toHaveLength(0);
  });
});
