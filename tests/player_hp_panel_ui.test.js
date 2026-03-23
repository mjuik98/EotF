import { describe, expect, it, vi } from 'vitest';
import { getPlayerHpPanelLevel, renderFloatingPlayerHpPanel } from '../game/shared/ui/player_hp_panel/public.js';
import { StatusTooltipUI } from '../game/features/combat/public.js';

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

  getBoundingClientRect() {
    return {
      left: 20,
      top: 20,
      right: 160,
      bottom: 48,
      width: 140,
      height: 28,
    };
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
  };
  doc.body = new MockElement(doc, 'body');
  return doc;
}

describe('player_hp_panel_ui', () => {
  it('classifies hp levels consistently', () => {
    expect(getPlayerHpPanelLevel({ player: { hp: 18, maxHp: 100 } })).toBe('critical');
    expect(getPlayerHpPanelLevel({ player: { hp: 28, maxHp: 100 } })).toBe('low');
    expect(getPlayerHpPanelLevel({ player: { hp: 50, maxHp: 100 } })).toBe('mid');
    expect(getPlayerHpPanelLevel({ player: { hp: 80, maxHp: 100 } })).toBe('safe');
  });

  it('renders a fixed hp panel for game and combat screens', () => {
    const doc = createMockDocument();
    const updateStatusDisplay = vi.fn();
    const gs = {
      currentScreen: 'combat',
      combat: { active: true },
      player: {
        hp: 18,
        maxHp: 100,
        shield: 12,
        buffs: { vulnerable: 1 },
      },
    };

    const shell = renderFloatingPlayerHpPanel({
      doc,
      gs,
      StatusEffectsUI: { updateStatusDisplay },
    });

    expect(shell?.id).toBe('ncFloatingHpShell');
    expect(doc.body.children.some((child) => child.id === 'ncFloatingHpShell')).toBe(true);
    expect(shell.querySelectorAll('.nc-hp-wrap')).toHaveLength(1);
    expect(shell.querySelectorAll('.nc-hp-shield-bar-fill')).toHaveLength(1);
    expect(shell.querySelectorAll('.nc-hp-danger-banner')).toHaveLength(1);
    expect(shell.querySelectorAll('.nc-hp-status-badges')).toHaveLength(1);
    expect(updateStatusDisplay).toHaveBeenCalledWith({
      doc,
      gs,
      StatusEffectsUI: { updateStatusDisplay },
      statusContainerId: 'ncFloatingHpStatusBadges',
    });
  });

  it('keeps the status container mounted even before the first buff is gained', () => {
    const doc = createMockDocument();
    const updateStatusDisplay = vi.fn();
    const gs = {
      currentScreen: 'combat',
      combat: { active: true },
      player: {
        hp: 50,
        maxHp: 100,
        shield: 0,
        buffs: {},
      },
    };

    const shell = renderFloatingPlayerHpPanel({
      doc,
      gs,
      StatusEffectsUI: { updateStatusDisplay },
    });

    expect(shell.querySelectorAll('.nc-hp-status-badges')).toHaveLength(1);
    expect(updateStatusDisplay).toHaveBeenCalledWith({
      doc,
      gs,
      StatusEffectsUI: { updateStatusDisplay },
      statusContainerId: 'ncFloatingHpStatusBadges',
    });
  });

  it('uses the injected StatusEffectsUI dependency when provided', () => {
    const doc = createMockDocument();
    const updateStatusDisplay = vi.fn();

    const gs = {
      currentScreen: 'combat',
      combat: { active: true },
      player: {
        hp: 50,
        maxHp: 100,
        shield: 0,
        buffs: { unbreakable_wall: { stacks: 99 } },
      },
    };

    renderFloatingPlayerHpPanel({
      doc,
      gs,
      StatusEffectsUI: { updateStatusDisplay },
    });

    expect(updateStatusDisplay).toHaveBeenCalledWith(expect.objectContaining({
      doc,
      gs,
      statusContainerId: 'ncFloatingHpStatusBadges',
    }));
  });

  it('restores the floating status tooltip after hp panel rerender', () => {
    const doc = createMockDocument();
    const showForAnchor = vi.spyOn(StatusTooltipUI, 'showForAnchor').mockImplementation(() => {});
    const statusEffectsUI = {
      getStatusMap: () => ({
        unbreakable_wall: {
          name: '불굴의 벽',
          icon: '🧱',
          buff: true,
          desc: '턴 시작 시 방어막 비례 피해를 가합니다.',
        },
      }),
      updateStatusDisplay: vi.fn(({ doc: renderDoc, statusContainerId }) => {
        const container = renderDoc.getElementById(statusContainerId);
        const badge = renderDoc.createElement('span');
        badge.className = 'hud-status-badge';
        badge.dataset.buffKey = 'unbreakable_wall';
        container?.appendChild(badge);
      }),
    };
    const gs = {
      currentScreen: 'combat',
      combat: { active: true },
      player: {
        hp: 50,
        maxHp: 100,
        shield: 8,
        buffs: { unbreakable_wall: { stacks: 99 } },
      },
    };

    const originalWindow = globalThis.window;
    globalThis.window = { innerWidth: 1280, innerHeight: 720 };

    try {
      renderFloatingPlayerHpPanel({ doc, gs, StatusEffectsUI: statusEffectsUI, StatusTooltipUI });

      const tooltip = doc.createElement('div');
      tooltip.id = 'statusTooltip';
      tooltip.className = 'visible';
      tooltip.dataset.statusKey = 'unbreakable_wall';
      tooltip.dataset.statusContainerId = 'ncFloatingHpStatusBadges';
      doc.body.appendChild(tooltip);

      showForAnchor.mockClear();
      gs.player.hp = 43;
      renderFloatingPlayerHpPanel({ doc, gs, StatusEffectsUI: statusEffectsUI, StatusTooltipUI });
      expect(showForAnchor).toHaveBeenCalledTimes(1);
      expect(showForAnchor.mock.calls[0][1]).toBe('unbreakable_wall');
      expect(showForAnchor.mock.calls[0][4]).toMatchObject({
        doc,
        statusContainerId: 'ncFloatingHpStatusBadges',
      });
    } finally {
      showForAnchor.mockRestore();
      globalThis.window = originalWindow;
    }
  });

  it('removes the fixed panel outside the run screens', () => {
    const doc = createMockDocument();
    renderFloatingPlayerHpPanel({
      doc,
      gs: {
        currentScreen: 'game',
        combat: { active: false },
        player: { hp: 50, maxHp: 100, shield: 0, buffs: {} },
      },
    });

    expect(doc.getElementById('ncFloatingHpShell')).not.toBeNull();

    renderFloatingPlayerHpPanel({
      doc,
      gs: {
        currentScreen: 'title',
        combat: { active: false },
        player: { hp: 50, maxHp: 100, shield: 0, buffs: {} },
      },
    });

    expect(doc.getElementById('ncFloatingHpShell')).toBeNull();
  });
});
