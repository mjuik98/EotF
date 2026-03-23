import { describe, expect, it } from 'vitest';

import { populateCombatCardFrame } from '../game/features/combat/presentation/browser/combat_card_frame_ui.js';

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName || 'div').toUpperCase();
    this.className = '';
    this.textContent = '';
    this.children = [];
    this.style = {};
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }
}

function createDoc() {
  return {
    createElement(tagName) {
      return new MockElement(tagName);
    },
  };
}

function findChild(root, predicate) {
  return root.children.find(predicate) || null;
}

describe('combat_card_frame_ui cost badges', () => {
  it('renders hand cost badges with shared variant and type classes', () => {
    const doc = createDoc();
    const root = doc.createElement('div');

    populateCombatCardFrame(root, doc, {
      cardId: 'guard',
      card: {
        name: '수비',
        icon: '🛡',
        type: 'SKILL',
        cost: 2,
        desc: '방어막 8 획득',
      },
      canPlay: true,
      displayCost: 1,
      totalDisc: 1,
    }, { variant: 'hand' });

    const costEl = findChild(root, (child) => String(child.className).includes('card-cost'));

    expect(costEl).toBeTruthy();
    expect(costEl.className).toContain('card-cost');
    expect(costEl.className).toContain('card-cost-hand');
    expect(costEl.className).toContain('card-cost-type-skill');
    expect(costEl.className).toContain('card-cost-discounted');
  });

  it('renders hover cost badges as the emphasized variant of the same system', () => {
    const doc = createDoc();
    const root = doc.createElement('div');

    populateCombatCardFrame(root, doc, {
      cardId: 'slash',
      card: {
        name: '베기',
        icon: '⚔',
        type: 'ATTACK',
        cost: 1,
        desc: '피해 6',
      },
      canPlay: true,
      displayCost: 0,
      anyFree: true,
    }, { variant: 'hover' });

    const costEl = findChild(root, (child) => String(child.className).includes('card-cost'));

    expect(costEl).toBeTruthy();
    expect(costEl.className).toContain('card-cost');
    expect(costEl.className).toContain('card-cost-hover');
    expect(costEl.className).toContain('card-cost-type-attack');
    expect(costEl.className).toContain('card-cost-free');
  });

  it('renders hover descriptions with the readable hover text block classes', () => {
    const doc = createDoc();
    const root = doc.createElement('div');

    populateCombatCardFrame(root, doc, {
      cardId: 'slash',
      card: {
        name: '베기',
        icon: '⚔',
        type: 'ATTACK',
        cost: 1,
        desc: '피해 6',
      },
      canPlay: true,
      displayCost: 1,
    }, { variant: 'hover' });

    const desc = findChild(root, (child) => String(child.className).includes('card-desc'));

    expect(desc.className).toContain('card-desc-hover');
    expect(desc.className).toContain('card-desc-hover-readable');
  });
});
