import { describe, expect, it } from 'vitest';
import { buildEnemyHpUpdateViewModel, syncCombatEnemyFloatingTooltips } from '../game/features/combat/public.js';

class MockElement {
  constructor() {
    this.className = '';
    this.style = {};
    this.children = [];
    this.classList = {
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.add(token));
        this.className = [...next].join(' ');
      },
      remove: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.delete(token));
        this.className = [...next].join(' ');
      },
      contains: (token) => this.className.split(/\s+/).filter(Boolean).includes(token),
    };
  }
}

function createMockDocument({ hoverStatus = false, hoverIntent = false } = {}) {
  const statusTooltip = new MockElement();
  statusTooltip.classList.add('visible');
  const intentTooltip = new MockElement();
  intentTooltip.id = 'intentTooltip';
  intentTooltip.classList.add('visible');

  return {
    _elements: new Map([
      ['enemyStatusTooltip', statusTooltip],
      ['intentTooltip', intentTooltip],
    ]),
    getElementById(id) {
      return this._elements.get(id) || null;
    },
    querySelector(selector) {
      if (selector === '.enemy-status-badge:hover') return hoverStatus ? {} : null;
      if (selector === '.enemy-intent:hover') return hoverIntent ? {} : null;
      return null;
    },
  };
}

describe('combat_enemy_runtime_ui', () => {
  it('clears floating status and intent tooltips when their anchors are no longer hovered', () => {
    const doc = createMockDocument();
    syncCombatEnemyFloatingTooltips(doc);

    expect(doc.getElementById('enemyStatusTooltip')?.classList.contains('visible')).toBe(false);
    expect(doc.getElementById('intentTooltip')?.classList.contains('visible')).toBe(false);
  });

  it('keeps floating tooltips visible while their anchors are still hovered', () => {
    const doc = createMockDocument({ hoverStatus: true, hoverIntent: true });
    syncCombatEnemyFloatingTooltips(doc);

    expect(doc.getElementById('enemyStatusTooltip')?.classList.contains('visible')).toBe(true);
    expect(doc.getElementById('intentTooltip')?.classList.contains('visible')).toBe(true);
  });

  it('builds hp-only update payloads with shared text and bar color data', () => {
    expect(buildEnemyHpUpdateViewModel({
      doc: { token: 'doc' },
      index: 2,
      enemy: { hp: 12, maxHp: 40, shield: 3 },
    })).toEqual({
      doc: { token: 'doc' },
      index: 2,
      enemy: { hp: 12, maxHp: 40, shield: 3 },
      hpPct: 30,
      hpText: '12 / 40 (방어막 3)',
      hpBarBackground: expect.any(String),
    });
  });
});
