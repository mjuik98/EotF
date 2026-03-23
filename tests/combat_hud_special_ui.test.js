import { describe, expect, it, vi } from 'vitest';
import { renderCombatHudClassSpecial } from '../game/ui/combat/combat_hud_special_ui.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
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

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    return node;
  }
}

function createMockDocument() {
  const doc = {
    _elements: new Map(),
    defaultView: { HTMLElement: MockElement },
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
  return doc;
}

describe('combat_hud_special_ui', () => {
  it('returns without mutating the deprecated hover hud area', () => {
    const doc = createMockDocument();
    const hover = doc.createElement('div');
    hover.id = 'hoverHudSpecial';

    const result = renderCombatHudClassSpecial(doc, {
      player: { class: 'swordsman' },
    }, {
      swordsman: {
        getSpecialUI: vi.fn(() => 'Special text'),
      },
    });

    expect(result).toBeNull();
    expect(hover.textContent).toBe('');
  });

  it('does not append nodes for the deprecated class special surface', () => {
    const doc = createMockDocument();
    const hover = doc.createElement('div');
    hover.id = 'hoverHudSpecial';
    const specialNode = doc.createElement('div');
    specialNode.textContent = 'node';

    renderCombatHudClassSpecial(doc, {
      player: { class: 'guardian' },
    }, {
      guardian: {
        getSpecialUI: vi.fn(() => specialNode),
      },
    }, {}, MockElement);

    expect(hover.children).toHaveLength(0);
  });

  it('is a no-op when no class mechanic is available', () => {
    const doc = createMockDocument();
    const hover = doc.createElement('div');
    hover.id = 'hoverHudSpecial';

    const result = renderCombatHudClassSpecial(doc, {
      player: { class: 'unknown' },
    }, {});

    expect(result).toBeNull();
    expect(hover.children).toHaveLength(0);
  });
});
