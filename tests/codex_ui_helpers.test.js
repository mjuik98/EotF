import { describe, expect, it } from 'vitest';

import {
  applyCodexFilter,
  buildCodexProgress,
  ensureCodexState,
  getBaseCodexCards,
  getCodexFilterDefinitions,
} from '../game/features/codex/public.js';

describe('codex_ui_helpers', () => {
  it('normalizes codex state containers to sets', () => {
    const codex = ensureCodexState({
      meta: {
        codex: {
          enemies: ['wolf'],
          cards: [],
          items: null,
        },
      },
    });

    expect(codex.enemies instanceof Set).toBe(true);
    expect(codex.enemies.has('wolf')).toBe(true);
    expect(codex.cards instanceof Set).toBe(true);
    expect(codex.items instanceof Set).toBe(true);
  });

  it('filters and sorts entries with explicit options', () => {
    const codex = {
      enemies: new Set(['boss-a', 'elite-a']),
      cards: new Set(),
      items: new Set(),
    };
    const entries = [
      { id: 'mob-a', name: 'Alpha', isBoss: false, isElite: false, isMiniBoss: false },
      { id: 'boss-a', name: 'Beta', isBoss: true, isElite: false, isMiniBoss: false },
      { id: 'elite-a', name: 'Gamma', isBoss: false, isElite: true, isMiniBoss: false },
    ];

    const filtered = applyCodexFilter(entries, codex, 'enemies', {
      filter: 'boss',
      sort: 'count',
      showUnknown: false,
      getRecord: (_category, id) => ({ kills: id === 'boss-a' ? 3 : 1 }),
    });

    expect(filtered.map((entry) => entry.id)).toEqual(['boss-a']);
  });

  it('computes progress against base cards only', () => {
    const progress = buildCodexProgress({
      meta: {
        codex: {
          enemies: new Set(['wolf']),
          cards: new Set(['strike']),
          items: new Set(['relic-a']),
        },
        inscriptions: { echo: 2 },
      },
    }, {
      enemies: { wolf: { id: 'wolf' }, boar: { id: 'boar' } },
      cards: {
        strike: { id: 'strike' },
        strike_plus: { id: 'strike_plus', baseCardId: 'strike' },
      },
      items: { 'relic-a': { id: 'relic-a' }, 'relic-b': { id: 'relic-b' } },
      inscriptions: { echo: { id: 'echo' }, void: { id: 'void' } },
    });

    expect(getBaseCodexCards({
      cards: {
        strike: { id: 'strike' },
        strike_plus: { id: 'strike_plus', baseCardId: 'strike' },
      },
    }).map((card) => card.id)).toEqual(['strike']);
    expect(progress.cards).toEqual({ seen: 1, total: 1 });
    expect(progress.percent).toBe(57);
  });

  it('builds item set filters when set data exists', () => {
    const defs = getCodexFilterDefinitions({
      itemSets: {
        void: { name: 'Void Set' },
      },
    });

    expect(defs.items.some((entry) => entry?.k === 'set:void')).toBe(true);
  });
});
