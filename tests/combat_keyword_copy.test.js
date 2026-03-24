import { describe, expect, it } from 'vitest';

import {
  createCombatCloneKeywordPanel,
  resolveCombatKeywordTooltips,
} from '../game/features/combat/presentation/browser/combat_keyword_copy.js';

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.className = '';
    this.dataset = {};
    this.textContent = '';
    this.listeners = new Map();
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }
}

function createDoc() {
  return {
    createElement(tagName) {
      return new MockElement(tagName);
    },
  };
}

describe('combat_keyword_copy', () => {
  it('deduplicates repeated exhaust keyword entries while preserving visible order', () => {
    const tooltips = resolveCombatKeywordTooltips({
      desc: '[소진] 피해 30. 기절 1턴 부여',
      exhaust: true,
    });

    expect(tooltips.map((entry) => entry.title)).toEqual(['소진', '기절']);
  });

  it('builds a closed keyword panel with matching mechanics triggers', () => {
    const doc = createDoc();

    const { mechanics, panel } = createCombatCloneKeywordPanel(doc, {
      desc: '[소진] 피해 30. 기절 1턴 부여',
      exhaust: true,
    });

    expect(mechanics.children).toHaveLength(2);
    expect(mechanics.children[0].textContent).toBe('소진');
    expect(panel.dataset.open).toBe('false');
    expect(panel.children[0].children[0].textContent).toBe('소진');
    expect(panel.children[1].children[0].textContent).toBe('소진');
  });
});
