import { describe, expect, it } from 'vitest';

import {
  createSetMemberRow,
} from '../game/shared/ui/item_detail/item_detail_markup.js';
import {
  resolveItemDetailPanelVariant,
} from '../game/shared/ui/item_detail/item_detail_panel_variants.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this._textContent = '';
    this.className = '';
    this.style = {};
    this.dataset = {};

    Object.defineProperty(this, 'textContent', {
      get: () => this._textContent,
      set: (value) => {
        this._textContent = value == null ? '' : String(value);
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
}

function createDoc() {
  const doc = {
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
  };
  return doc;
}

describe('item detail panel helpers', () => {
  it('resolves explicit variants and falls back to combat for unknown names', () => {
    expect(resolveItemDetailPanelVariant({ variant: 'inline' })).toMatchObject({
      name: 'inline',
      gap: '6px',
      enterTransform: 'translateY(3px)',
    });
    expect(resolveItemDetailPanelVariant({ variant: 'missing' })).toMatchObject({
      name: 'combat',
      gap: '8px',
      enterTransform: 'translateY(4px)',
    });
  });

  it('renders owned set members with the ownership badge', () => {
    const doc = createDoc();
    const row = createSetMemberRow(
      doc,
      { id: 'legendary_relic', icon: '✧', name: '전설 유물', owned: true },
      '8px 10px',
      '10px',
      '11px',
    );

    expect(row.className).toContain('is-owned');
    expect(row.children[0].textContent).toBe('✧ 전설 유물');
    expect(row.children[1].textContent).toBe('보유');
  });
});
