import { describe, expect, it, vi } from 'vitest';

import {
  createUnifiedParticles,
  detectCardTags,
  getCardTypeClass,
  getCardTypeLabelClass,
} from '../game/features/combat/public.js';

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.className = '';
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

describe('card_render_helpers_ui', () => {
  it('resolves card type classes', () => {
    expect(getCardTypeClass('Attack')).toBe('type-attack');
    expect(getCardTypeLabelClass('skill')).toBe('card-type-skill');
    expect(getCardTypeClass('unknown')).toBe('');
  });

  it('detects card tags from flags and highlighted tokens', () => {
    expect(detectCardTags({ exhaust: true, desc: '' })).toEqual({
      exhaust: true,
      persistent: false,
      instant: false,
    });
    expect(detectCardTags({ desc: '[지속] [즉시]' })).toEqual({
      exhaust: false,
      persistent: true,
      instant: true,
    });
  });

  it('creates shared particle wrappers for card and clone variants', () => {
    const doc = createDoc();
    const rng = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const normal = createUnifiedParticles(doc, '#fff');
    const clone = createUnifiedParticles(doc, '#fff', { isClone: true });

    expect(normal.className).toBe('card-particles');
    expect(normal.children).toHaveLength(6);
    expect(clone.className).toBe('card-particles card-particles-aura');
    expect(clone.children).toHaveLength(3);
    expect(clone.children[0].className).toBe('card-aura card-aura-haze');
    expect(clone.children[0].style.cssText).toContain('--aura-color: #fff;');

    rng.mockRestore();
  });
});
