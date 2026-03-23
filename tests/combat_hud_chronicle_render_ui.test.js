import { describe, expect, it } from 'vitest';

import {
  groupLogsByTurn,
  renderBattleChronicleEntries,
  summarizeTurnStats,
} from '../game/features/combat/public.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.dataset = {};
    this.style = {};
    this._textContent = '';
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this.children = [];
  }

  get textContent() {
    return this._textContent;
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }
}

function createDoc() {
  return {
    createElement(tagName) {
      return new MockElement(this, tagName);
    },
  };
}

describe('combat_hud_chronicle_render_ui', () => {
  it('groups logs by turn and summarizes totals', () => {
    const groups = groupLogsByTurn([
      { turn: 3, msg: '적에게 8 피해', type: 'attack' },
      { turn: 1, msg: '3 회복', type: 'heal' },
      { turn: 1, msg: '방어막 +4', type: 'shield' },
    ]);

    expect(groups.map((group) => group.turn)).toEqual([1, 3]);
    expect(summarizeTurnStats(groups[0].entries)).toEqual({
      totalDamage: 0,
      totalHeal: 3,
      totalShield: 4,
    });
  });

  it('renders grouped chronicle entries with per-turn summaries', () => {
    const doc = createDoc();
    const list = new MockElement(doc, 'div');

    renderBattleChronicleEntries(doc, list, [
      { turn: 1, msg: '적에게 5 피해', type: 'action' },
      { turn: 1, msg: '2 회복', type: 'heal' },
      { turn: 2, msg: '방어막 +3', type: 'shield' },
    ]);

    expect(list.children).toHaveLength(2);
    expect(list.children[0].children[0].textContent).toBe('턴 1');
    expect(list.children[0].children[1].textContent).toBe('피해 5  ·  회복 2');
    expect(list.children[1].children[1].textContent).toBe('방어막 3');
  });
});
