import { describe, expect, it } from 'vitest';
import { renderCodexSection } from '../game/ui/screens/codex_ui_section_render.js';

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.className = '';
    this.innerHTML = '';
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

describe('codex_ui_section_render', () => {
  it('renders a section shell and appends built cards into the grid', () => {
    const doc = createDoc();
    const container = new MockElement();
    const card = new MockElement();
    card.innerHTML = 'Strike';

    renderCodexSection(doc, container, {
      title: '공격 카드',
      icon: '⚔️',
      entries: [{ id: 'strike' }],
      seenCount: 1,
      buildCard: () => card,
    });

    expect(container.children).toHaveLength(1);
    expect(container.children[0].innerHTML).toContain('1 / 1');
    expect(container.children[0].children[0].className).toBe('cx-grid');
    expect(container.children[0].children[0].children[0]).toBe(card);
  });
});
