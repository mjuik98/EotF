import { describe, expect, it } from 'vitest';

import {
  applyCombatRelicPanelVisuals,
  applyCombatRelicSlotVisuals,
} from '../game/features/combat/presentation/browser/combat_relic_visuals.js';

class MockElement {
  constructor() {
    this.children = [];
    this.style = { cssText: '' };
    this.attributes = {};
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }
}

function createDoc() {
  return {
    createElement() {
      return new MockElement();
    },
  };
}

describe('combat_relic_visuals', () => {
  it('applies rarity styling and set-state badge to relic slots', () => {
    const slot = new MockElement();

    applyCombatRelicSlotVisuals(slot, 'legendary', 'active', createDoc());

    expect(slot.style.cssText).toContain('border-color:rgba(192,132,252,.42)');
    expect(slot.children).toHaveLength(1);
    expect(slot.children[0].attributes['aria-hidden']).toBe('true');
  });

  it('applies rarity styling to the relic detail panel', () => {
    const panel = { style: {} };

    applyCombatRelicPanelVisuals(panel, 'rare');

    expect(panel.style.borderColor).toBe('rgba(240,180,41,.28)');
    expect(panel.style.boxShadow).toContain('rgba(240,180,41,.08)');
  });
});
