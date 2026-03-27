import { describe, expect, it } from 'vitest';

import {
  buildEndingChips,
  buildEndingDeckPreview,
  buildEndingInscriptions,
  buildEndingPayload,
  buildEndingRegions,
  decorateEndingPayloadForOutcome,
  getEndingOutcomeDecoration,
} from '../game/features/ui/public.js';

describe('ending_screen_helpers', () => {
  it('builds payload with fallback region and deck metadata', () => {
    const payload = buildEndingPayload({
      meta: {
        storyPieces: [1, 2],
        inscriptions: { flow: 2 },
        runCount: 4,
      },
      player: {
        kills: 6,
        deck: ['spark'],
      },
      stats: {
        maxChain: 5,
        damageDealt: 234,
        cardsPlayed: 9,
        clearTimeMs: 90500,
        regionClearTimes: [15000],
      },
      currentRegion: 0,
      runOutcomeUnlocks: [
        { type: 'curse', id: 'blood_moon', source: 'first_victory' },
      ],
      runOutcomeAchievements: ['first_victory'],
    }, {
      storyFragments: [1, 2, 3],
      cards: {
        spark: { name: 'Spark', rarity: 'rare', icon: '⚡', desc: 'Deal 8 damage.', type: 'attack', cost: 1 },
      },
      inscriptions: {
        flow: { name: 'Flow', icon: '🜁' },
      },
    });

    expect(payload.score).toBe(45);
    expect(payload.rank.glyph).toBe('C');
    expect(payload.regions[0]).toMatchObject({ name: '지역 1', icon: '🌲', time: '00:15', boss: true });
    expect(payload.deck[0]).toMatchObject({
      id: 'spark',
      title: 'Spark',
      cls: 'r',
      desc: 'Deal 8 damage.',
      typeLabel: '공격',
      rarityLabel: '희귀',
      costText: '1',
    });
    expect(payload.inscriptions[0]).toMatchObject({ id: 'flow', level: 2, icon: '🜁', name: 'Flow' });
    expect(payload.chips).toContain('4회차');
    expect(payload.unlocks).toEqual([
      expect.objectContaining({ type: 'curse', id: 'blood_moon', label: '저주 해금 · 핏빛 월식' }),
    ]);
    expect(payload.achievements).toEqual([
      expect.objectContaining({
        id: 'first_victory',
        icon: '🏁',
        title: '첫 승리',
      }),
    ]);
  });

  it('builds regions, deck preview, inscriptions, and chips from dedicated helpers', () => {
    const gs = {
      currentRegion: 1,
      regionRoute: { 1: 7 },
      meta: {
        storyPieces: [1, 2, 3],
        inscriptions: { flow: 2, frost: false },
        runCount: 2,
      },
      player: {
        deck: ['spark', 'guard'],
      },
      stats: {
        deathCount: 0,
        regionClearTimes: [15000, 30000],
      },
    };
    const data = {
      regions: [null, { id: 7, name: '빙결 회랑', icon: '❄', accentBase: 'rgba(1,2,3,' }],
      cards: {
        spark: { name: 'Spark', rarity: 'rare', icon: '⚡', desc: 'Deal 8 damage.', type: 'attack', cost: 1 },
        guard: { name: 'Guard', rarity: 'legendary', icon: '🛡', desc: 'Gain 12 block.', type: 'skill', cost: 2 },
      },
      inscriptions: {
        flow: { name: 'Flow', icon: '🜁' },
      },
    };

    expect(buildEndingRegions(gs, data)).toEqual([
      expect.objectContaining({ name: '지역 1', icon: '🌲', time: '00:15', boss: false }),
      expect.objectContaining({ name: '빙결 회랑', icon: '❄', accent: 'rgba(1,2,3,', time: '00:30', boss: true }),
    ]);
    expect(buildEndingDeckPreview(gs, data)).toEqual([
      expect.objectContaining({
        id: 'spark',
        title: 'Spark',
        cls: 'r',
        desc: 'Deal 8 damage.',
        typeLabel: '공격',
        rarityLabel: '희귀',
        costText: '1',
      }),
      expect.objectContaining({
        id: 'guard',
        title: 'Guard',
        cls: 'l',
        desc: 'Gain 12 block.',
        typeLabel: '스킬',
        rarityLabel: '전설',
        costText: '2',
      }),
    ]);
    expect(buildEndingInscriptions(gs, data)).toEqual([
      expect.objectContaining({ id: 'flow', level: 2, icon: '🜁', name: 'Flow' }),
    ]);
    expect(buildEndingChips(gs, 3, 3)).toEqual(['노 데스', '풀 스토리', '2회차']);
  });

  it('decorates abandon outcome and removes codex button from markup', () => {
    const payload = decorateEndingPayloadForOutcome({
      chips: ['노 데스'],
      title: 'base',
      subtitle: 'base',
      eyebrow: 'base',
      quote: 'base',
      stats: [],
    }, 'abandon');

    expect(payload.title).toBe('멈춘 메아리');
    expect(payload.chips).toContain('런 포기');
  });

  it('returns null for victory decoration and defeat metadata for defeat outcome', () => {
    expect(getEndingOutcomeDecoration('victory')).toBeNull();
    expect(getEndingOutcomeDecoration('defeat')).toMatchObject({
      title: '무너진 메아리',
      chip: '패배',
    });
  });
});
