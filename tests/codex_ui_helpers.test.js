import { describe, expect, it } from 'vitest';

import {
  applyCodexFilter,
  buildCodexRewardRoadmap,
  buildCodexProgress,
  buildRecentCodexDiscoveries,
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

  it('keeps codex visible copy aligned with shared card and rarity labels', () => {
    const defs = getCodexFilterDefinitions({});

    expect(defs.cards.map((entry) => entry?.l)).toEqual(['전체', '공격', '기술', '능력']);
    expect(defs.items.map((entry) => entry?.l)).toContain('비범');
    expect(defs.items.some((entry) => entry?.k === 'set:serpents_gaze')).toBe(true);
  });

  it('builds the nearest codex reward milestones across categories', () => {
    const meta = {
      codex: {
        enemies: new Set(['wolf', 'boar', 'slime', 'cultist', 'echo']),
        cards: new Set(['strike', 'defend', 'charge', 'afterimage', 'prediction', 'time_echo']),
        items: new Set(['dull_blade', 'void_compass', 'guardian_seal']),
      },
      contentUnlocks: {
        curses: {},
        relics: {},
        relicsByClass: {},
        cards: { shared: {} },
      },
    };

    expect(buildCodexRewardRoadmap(meta)).toEqual([
      expect.objectContaining({
        contentId: 'curator_lantern',
        achievementTitle: '야전 생물학자',
        progressLabel: '5 / 12',
        focusLabel: '적 도감',
      }),
      expect.objectContaining({
        contentId: 'ink_reservoir',
        achievementTitle: '전투 서기관',
        progressLabel: '6 / 15',
        focusLabel: '카드 도감',
      }),
    ]);
  });

  it('surfaces recent codex discoveries from record history', () => {
    const meta = {
      codexRecords: {
        enemies: {
          wolf: { firstSeen: '2026-03-24', encounters: 3, kills: 2 },
        },
        cards: {
          strike: { firstSeen: '2026-03-26', used: 7 },
        },
        items: {
          void_compass: { firstSeen: '2026-03-25', found: 1 },
        },
      },
    };

    expect(buildRecentCodexDiscoveries(meta, { limit: 2 })).toEqual([
      expect.objectContaining({
        category: 'cards',
        id: 'strike',
        firstSeen: '2026-03-26',
      }),
      expect.objectContaining({
        category: 'items',
        id: 'void_compass',
        firstSeen: '2026-03-25',
      }),
    ]);
  });
});
