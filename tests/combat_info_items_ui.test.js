import { describe, expect, it } from 'vitest';
import { renderCombatInfoItems } from '../game/ui/combat/combat_info_items_ui.js';

class MockFragment {
  constructor() {
    this.children = [];
    this.isFragment = true;
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }
}

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.style = {};
    this._textContent = '';
  }

  appendChild(node) {
    if (node?.isFragment) {
      this.children.push(...node.children);
      return node;
    }
    this.children.push(node);
    return node;
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this.children = [];
  }

  get textContent() {
    return this._textContent;
  }
}

function createDoc() {
  return {
    createElement(tagName) {
      return new MockElement(tagName);
    },
    createDocumentFragment() {
      return new MockFragment();
    },
  };
}

describe('combat_info_items_ui', () => {
  it('renders empty fallback and sorts items by rarity', () => {
    const doc = createDoc();
    const itemEl = new MockElement('div');

    renderCombatInfoItems({
      doc,
      itemEl,
      items: [],
      data: { items: {} },
    });
    expect(itemEl.children[0].textContent).toBe('없음');

    renderCombatInfoItems({
      doc,
      itemEl,
      items: ['common_item', 'rare_item'],
      data: {
        items: {
          common_item: { name: 'Common Item', desc: 'common', rarity: 'common', icon: 'C' },
          rare_item: { name: 'Rare Item', desc: 'rare', rarity: 'rare', icon: 'R' },
        },
      },
    });

    expect(itemEl.children).toHaveLength(2);
    expect(itemEl.children[0].children[1].children[0].textContent).toBe('Rare Item');
    expect(itemEl.children[1].children[1].children[0].textContent).toBe('Common Item');
  });
});
