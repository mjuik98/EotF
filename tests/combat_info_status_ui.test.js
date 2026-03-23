import { describe, expect, it } from 'vitest';
import { renderCombatInfoStatuses } from '../game/features/combat/public.js';

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
    this.title = '';
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

describe('combat_info_status_ui', () => {
  it('renders empty fallback and buff/debuff badges with stack values', () => {
    const doc = createDoc();
    const statusEl = new MockElement('div');

    renderCombatInfoStatuses({
      doc,
      statusEl,
      buffs: {},
      statusKr: {},
    });
    expect(statusEl.children[0].textContent).toBe('없음');

    renderCombatInfoStatuses({
      doc,
      statusEl,
      buffs: {
        weakened: { turns: 2 },
        resonance: { dmgBonus: 3, stacks: 4 },
      },
      statusKr: {
        weakened: { icon: 'W', name: '약화', buff: false, desc: 'debuff' },
        resonance: { icon: 'R', name: '공명', buff: true, desc: 'buff' },
      },
    });

    expect(statusEl.children).toHaveLength(2);
    expect(statusEl.children[0].textContent).toContain('약화');
    expect(statusEl.children[0].title).toBe('debuff');
    expect(statusEl.children[0].style.cssText).toContain('#ff6677');
    expect(statusEl.children[1].textContent).toContain('공명');
    expect(statusEl.children[1].style.cssText).toContain('#55ff99');
  });
});
