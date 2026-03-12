import { describe, expect, it, vi } from 'vitest';

import { buildCombatEndOutcome } from '../game/features/combat/presentation/build_combat_end_outcome.js';

describe('build_combat_end_outcome', () => {
  it('captures boss, region, and summary data before combat cleanup', () => {
    const gs = {
      combat: {
        bossDefeated: false,
        miniBossDefeated: false,
        enemies: [{ isBoss: true }],
      },
      currentNode: { type: 'boss' },
      currentRegion: 2,
      stats: {
        damageDealt: 25,
        damageTaken: 9,
      },
      player: {
        kills: 4,
      },
      _combatStartDmg: 10,
      _combatStartTaken: 2,
      _combatStartKills: 1,
    };

    const outcome = buildCombatEndOutcome(gs, {
      getBaseRegionIndex: vi.fn(() => 0),
      getRegionCount: vi.fn(() => 1),
      isEndlessRun: vi.fn(() => true),
    });

    expect(outcome.isBoss).toBe(true);
    expect(outcome.returnDirectlyToRun).toBe(true);
    expect(outcome.rewardMode).toBe('boss');
    expect(outcome.summary).toEqual({
      dealt: 15,
      taken: 7,
      kills: 3,
    });
  });

  it('falls back to mini boss rewards when applicable', () => {
    const outcome = buildCombatEndOutcome({
      combat: {
        enemies: [{ isMiniBoss: true }],
      },
      currentNode: { type: 'mini_boss' },
      stats: {},
      player: {},
    });

    expect(outcome.isBoss).toBe(false);
    expect(outcome.isMiniBoss).toBe(true);
    expect(outcome.rewardMode).toBe('mini_boss');
  });
});
