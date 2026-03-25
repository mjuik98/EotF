import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderCombatInfoItems } from '../game/features/combat/public.js';

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
    this.className = '';
    this._textContent = '';
    this._innerHTML = '';
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

  set innerHTML(value) {
    this._innerHTML = String(value ?? '');
  }

  get innerHTML() {
    return this._innerHTML;
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
          common_item: { name: 'Common Item', desc: '에너지 1 획득', rarity: 'common', icon: 'C' },
          rare_item: { name: 'Rare Item', desc: '피해 14. 잔향 20 충전 [소진]', rarity: 'rare', icon: 'R' },
        },
      },
    });

    expect(itemEl.children).toHaveLength(2);
    expect(itemEl.children[0].children[1].children[0].textContent).toBe('Rare Item');
    expect(itemEl.children[1].children[1].children[0].textContent).toBe('Common Item');
    expect(itemEl.children[0].children[1].children[1].innerHTML).toContain('kw-dmg');
    expect(itemEl.children[0].children[1].children[1].innerHTML).toContain('kw-echo');
    expect(itemEl.children[0].children[1].children[1].className).toBe('hud-item-tip-desc combat-info-item-desc');
  });

  it('styles combat info item descriptions with the shared keyword palette', () => {
    const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

    expect(css).toContain('.combat-info-item-desc .kw-dmg');
    expect(css).toContain('.combat-info-item-desc .kw-energy');
    expect(css).toContain('.combat-info-item-desc .kw-exhaust.kw-block');
  });
});
