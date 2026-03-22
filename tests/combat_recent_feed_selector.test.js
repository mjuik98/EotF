import { describe, expect, it } from 'vitest';

import { selectRecentCombatFeedEntries } from '../game/features/combat/presentation/browser/combat_recent_feed_selector.js';

describe('combat_recent_feed_selector', () => {
  it('keeps player-driven card results and excludes system and enemy-turn noise', () => {
    const entries = [
      { id: 'sys', msg: '⚔️ 전투 시작!', type: 'system' },
      { id: 'turn', msg: '── 턴 1 ──', type: 'turn-divider' },
      { id: 'enemy', msg: '⚔️ 적 → 플레이어: 7 피해', type: 'damage' },
      { id: 'target', msg: '🎯 슬라임 타겟 지정', type: 'system' },
      { id: 'card', msg: '🃏 [강타] → 슬라임: 12 피해', type: 'card-log' },
      { id: 'shield', msg: '🃏 [방호 태세]: 방어막 +8', type: 'buff' },
    ];

    expect(selectRecentCombatFeedEntries(entries)).toEqual([
      entries[4],
      entries[5],
    ]);
  });

  it('keeps only the latest 3 eligible entries', () => {
    const entries = [
      { id: '1', msg: '🃏 [베기] → 슬라임: 4 피해', type: 'card-log' },
      { id: '2', msg: '🃏 [방호]: 방어막 +6', type: 'buff' },
      { id: '3', msg: '✨ 공명 폭발: 10 피해!', type: 'echo' },
      { id: '4', msg: '🃏 [응급 처치]: 5 회복', type: 'card-log' },
    ];

    expect(selectRecentCombatFeedEntries(entries).map((entry) => entry.id)).toEqual(['2', '3', '4']);
  });

  it('returns an empty list when no entries are eligible', () => {
    const entries = [
      { id: '1', msg: '⚔️ 전투 시작!', type: 'system' },
      { id: '2', msg: '── 턴 1 ──', type: 'turn-divider' },
      { id: '3', msg: '⚔️ 적 → 플레이어: 9 피해', type: 'damage' },
    ];

    expect(selectRecentCombatFeedEntries(entries)).toEqual([]);
  });

  it('prefers metadata eligibility and compressed recent-feed text over raw messages', () => {
    const entries = [
      {
        id: 'enemy',
        msg: '⚔️ 적 → 플레이어: 9 피해',
        type: 'damage',
        meta: {
          recentFeed: {
            eligible: false,
          },
        },
      },
      {
        id: 'heal',
        msg: '💚 플레이어: 6 회복',
        type: 'heal',
        meta: {
          source: { type: 'card', id: 'first_aid', name: '응급 처치' },
          recentFeed: {
            eligible: true,
            text: '[응급 처치]: 6 회복',
          },
        },
      },
    ];

    expect(selectRecentCombatFeedEntries(entries)).toEqual([
      expect.objectContaining({
        id: 'heal',
        msg: '[응급 처치]: 6 회복',
      }),
    ]);
  });
});
