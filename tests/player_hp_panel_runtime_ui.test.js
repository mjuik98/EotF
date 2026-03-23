import { describe, expect, it, vi } from 'vitest';

import { StatusTooltipUI } from '../game/features/combat/public.js';
import {
  captureFloatingTooltipState,
  restoreFloatingTooltipState,
  shouldShowFloatingPlayerHpPanel,
} from '../game/shared/ui/player_hp_panel/public.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.dataset = {};

    this.classList = {
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
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
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

describe('player_hp_panel_runtime_ui', () => {
  it('captures only floating hp tooltip state and checks visible screens', () => {
    const doc = createMockDocument();
    const tooltip = doc.createElement('div');
    tooltip.id = 'statusTooltip';
    tooltip.className = 'visible';
    tooltip.dataset.statusKey = 'unbreakable_wall';
    tooltip.dataset.statusContainerId = 'ncFloatingHpStatusBadges';

    expect(captureFloatingTooltipState(doc)).toEqual({ statusKey: 'unbreakable_wall' });
    expect(shouldShowFloatingPlayerHpPanel({ currentScreen: 'game', combat: { active: false }, player: {} })).toBe(true);
    expect(shouldShowFloatingPlayerHpPanel({ currentScreen: 'title', combat: { active: false }, player: {} })).toBe(false);
  });

  it('restores tooltip anchors when the matching badge exists after rerender', () => {
    const doc = createMockDocument();
    const shell = doc.createElement('div');
    shell.id = 'ncFloatingHpShell';
    const badge = doc.createElement('span');
    badge.dataset.buffKey = 'unbreakable_wall';
    shell.appendChild(badge);

    const showForAnchor = vi.spyOn(StatusTooltipUI, 'showForAnchor').mockImplementation(() => {});
    try {
      restoreFloatingTooltipState(doc, {
        player: { buffs: { unbreakable_wall: { stacks: 2 } } },
      }, {
        StatusTooltipUI,
        StatusEffectsUI: {
          getStatusMap: () => ({
            unbreakable_wall: { name: '불굴의 벽' },
          }),
        },
      }, { statusKey: 'unbreakable_wall' });

      expect(showForAnchor).toHaveBeenCalledTimes(1);
      expect(showForAnchor.mock.calls[0][1]).toBe('unbreakable_wall');
    } finally {
      showForAnchor.mockRestore();
    }
  });
});
