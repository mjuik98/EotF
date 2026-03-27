import { describe, expect, it } from 'vitest';

import { applyContentUnlockRewards } from '../game/features/meta_progression/application/apply_content_unlock_rewards.js';
import { evaluateAchievementTrigger } from '../game/features/meta_progression/application/evaluate_achievement_trigger.js';
import { reconcileMetaProgression } from '../game/features/meta_progression/application/reconcile_meta_progression.js';

describe('evaluate achievement trigger', () => {
  it('unlocks first_victory from a run-completed victory event', () => {
    const meta = {
      achievements: { version: 1, states: {} },
      contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
      progress: { victories: 1, bossKills: {} },
    };

    const result = evaluateAchievementTrigger(meta, 'run_completed', {
      kind: 'victory',
      runConfig: { curse: 'none' },
    });

    expect(result.newlyUnlockedAchievements).toEqual(['first_victory']);
    expect(result.newlyUnlockedContent).toEqual([
      { type: 'curse', id: 'blood_moon', source: 'first_victory' },
    ]);
    expect(meta.achievements.states.first_victory.unlocked).toBe(true);
    expect(meta.contentUnlocks.curses.blood_moon.unlocked).toBe(true);
  });

  it('unlocks cursed_conqueror_1 from a cursed victory', () => {
    const meta = {
      achievements: {
        version: 1,
        states: {
          first_victory: { unlocked: true, unlockedAt: 1, progress: 1 },
        },
      },
      contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
      progress: { victories: 2, cursedVictories: 1, bossKills: {} },
    };

    const result = evaluateAchievementTrigger(meta, 'run_completed', {
      kind: 'victory',
      runConfig: { curse: 'tax' },
    });

    expect(result.newlyUnlockedAchievements).toEqual(['cursed_conqueror_1']);
    expect(meta.contentUnlocks.curses.void_oath.unlocked).toBe(true);
  });

  it('retroactively unlocks already-satisfied achievements', () => {
    const meta = {
      achievements: { version: 1, states: {} },
      contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
      progress: { victories: 4, cursedVictories: 3, bossKills: {} },
      classProgress: {
        levels: { swordsman: 3 },
        xp: { swordsman: 220 },
        pendingSummaries: [],
      },
    };

    reconcileMetaProgression(meta);

    expect(meta.achievements.states.first_victory.unlocked).toBe(true);
    expect(meta.achievements.states.cursed_conqueror_1.unlocked).toBe(true);
    expect(meta.achievements.states.veteran_victory_3.unlocked).toBe(true);
    expect(meta.achievements.states.cursed_conqueror_3.unlocked).toBe(true);
    expect(meta.achievements.states.swordsman_mastery_3.unlocked).toBe(true);
    expect(meta.contentUnlocks.curses.blood_moon.unlocked).toBe(true);
    expect(meta.contentUnlocks.curses.void_oath.unlocked).toBe(true);
    expect(meta.contentUnlocks.curses.shadow_burden.unlocked).toBe(true);
    expect(meta.contentUnlocks.curses.ruinous_tide.unlocked).toBe(true);
    expect(meta.contentUnlocks.cards.swordsman.blade_dance.unlocked).toBe(true);
  });

  it('unlocks shared veteran and class mastery rewards when their stored progress is satisfied', () => {
    const meta = {
      achievements: {
        version: 1,
        states: {
          first_victory: { unlocked: true, unlockedAt: 1, progress: 1 },
          cursed_conqueror_1: { unlocked: true, unlockedAt: 2, progress: 1 },
        },
      },
      contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
      progress: { victories: 3, cursedVictories: 3, bossKills: {} },
      classProgress: {
        levels: { guardian: 3 },
        xp: { guardian: 220 },
        pendingSummaries: [],
      },
    };

    const result = evaluateAchievementTrigger(meta, 'run_completed', { kind: 'victory', runConfig: { curse: 'tax' } });

    expect(result.newlyUnlockedAchievements).toEqual([
      'veteran_victory_3',
      'cursed_conqueror_3',
      'guardian_mastery_3',
    ]);
    expect(meta.contentUnlocks.curses.shadow_burden.unlocked).toBe(true);
    expect(meta.contentUnlocks.curses.ruinous_tide.unlocked).toBe(true);
    expect(meta.contentUnlocks.relicsByClass.guardian.guardian_seal.unlocked).toBe(true);
  });

  it('stores shared card rewards in the shared bucket', () => {
    const meta = {
      contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
    };

    const unlocked = applyContentUnlockRewards(meta, [
      { type: 'unlock', contentType: 'card', contentId: 'shared_burst' },
    ], 'first_victory', 123);

    expect(meta.contentUnlocks.cards.shared.shared_burst).toMatchObject({
      unlocked: true,
      unlockedAt: 123,
      source: 'first_victory',
    });
    expect(unlocked).toEqual([
      { type: 'card', id: 'shared_burst', source: 'first_victory' },
    ]);
  });

  it('stores class-scoped card rewards in the class bucket', () => {
    const meta = {
      contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
    };

    const unlocked = applyContentUnlockRewards(meta, [
      { type: 'unlock', contentType: 'card', contentId: 'echo_slash', classId: 'swordsman' },
    ], 'swordsman_mastery_1', 456);

    expect(meta.contentUnlocks.cards.swordsman.echo_slash).toMatchObject({
      unlocked: true,
      unlockedAt: 456,
      source: 'swordsman_mastery_1',
    });
    expect(unlocked).toEqual([
      { type: 'card', id: 'echo_slash', classId: 'swordsman', source: 'swordsman_mastery_1' },
    ]);
  });

  it('stores class-scoped relic rewards in a dedicated class bucket', () => {
    const meta = {
      contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
    };

    const unlocked = applyContentUnlockRewards(meta, [
      { type: 'unlock', contentType: 'relic', contentId: 'void_compass', classId: 'swordsman' },
    ], 'swordsman_mastery_2', 789);

    expect(meta.contentUnlocks.relicsByClass.swordsman.void_compass).toMatchObject({
      unlocked: true,
      unlockedAt: 789,
      source: 'swordsman_mastery_2',
    });
    expect(unlocked).toEqual([
      { type: 'relic', id: 'void_compass', classId: 'swordsman', source: 'swordsman_mastery_2' },
    ]);
  });

  it('supports account-wide unlocks from victories, best chain, and world memory progress', () => {
    const meta = {
      achievements: { version: 1, states: {} },
      contentUnlocks: { version: 1, curses: {}, relics: {}, relicsByClass: {}, cards: { shared: {} } },
      progress: { victories: 5, failures: 0, bossKills: {} },
      bestChain: 12,
      worldMemory: {
        savedMerchant: 1,
      },
    };

    const result = evaluateAchievementTrigger(meta, 'run_completed', {
      kind: 'victory',
      runConfig: { curse: 'none' },
    });

    expect(result.newlyUnlockedAchievements).toEqual([
      'first_victory',
      'veteran_victory_3',
      'veteran_victory_5',
      'chain_master_12',
      'merchant_ally',
    ]);
    expect(meta.contentUnlocks.curses.blood_moon.unlocked).toBe(true);
    expect(meta.contentUnlocks.curses.shadow_burden.unlocked).toBe(true);
    expect(meta.contentUnlocks.relics.dimension_key.unlocked).toBe(true);
    expect(meta.contentUnlocks.relics.glitch_circuit.unlocked).toBe(true);
    expect(meta.contentUnlocks.relics.ancient_battery.unlocked).toBe(true);
  });

  it('supports account-wide unlocks from accumulated failures on non-victory outcomes', () => {
    const meta = {
      achievements: { version: 1, states: {} },
      contentUnlocks: { version: 1, curses: {}, relics: {}, relicsByClass: {}, cards: { shared: {} } },
      progress: { victories: 0, failures: 3, bossKills: {} },
    };

    const result = evaluateAchievementTrigger(meta, 'run_completed', {
      kind: 'defeat',
      runConfig: { curse: 'none' },
    });

    expect(result.newlyUnlockedAchievements).toEqual(['scarred_return_3']);
    expect(meta.contentUnlocks.relics.eternal_fragment.unlocked).toBe(true);
  });

  it('supports story and codex based account unlocks from stored meta progress', () => {
    const meta = {
      achievements: { version: 1, states: {} },
      contentUnlocks: { version: 1, curses: {}, relics: {}, relicsByClass: {}, cards: { shared: {} } },
      progress: { victories: 0, failures: 0, bossKills: {} },
      storyPieces: [1, 2, 3, 4, 5],
      codex: {
        enemies: new Set(['wolf', 'boar', 'shade', 'bishop', 'cultist', 'harpy', 'warden', 'slug']),
        cards: new Set(['strike', 'guard', 'charge', 'slash', 'spark', 'wall']),
        items: new Set(['relic_a', 'relic_b', 'relic_c', 'relic_d', 'relic_e', 'relic_f']),
      },
    };

    const result = evaluateAchievementTrigger(meta, 'run_completed', {
      kind: 'victory',
      runConfig: { curse: 'none' },
    });

    expect(result.newlyUnlockedAchievements).toEqual([
      'story_seeker_5',
      'codex_survey_20',
    ]);
    expect(meta.contentUnlocks.relics.memory_thread.unlocked).toBe(true);
    expect(meta.contentUnlocks.relics.field_journal.unlocked).toBe(true);
  });

  it('supports boss, region, and ascension milestones from diversified run progress', () => {
    const meta = {
      achievements: { version: 1, states: {} },
      contentUnlocks: { version: 1, curses: {}, relics: {}, relicsByClass: {}, cards: { shared: {} } },
      progress: {
        victories: 6,
        failures: 0,
        bossKills: { silent_tyrant: 1 },
        regionVictories: { 1: 1 },
        highestVictoryAscension: 5,
      },
    };

    const result = evaluateAchievementTrigger(meta, 'run_completed', {
      kind: 'victory',
      runConfig: { curse: 'none', ascension: 5 },
    });

    expect(result.newlyUnlockedAchievements).toEqual(expect.arrayContaining([
      'silent_tyrant_hunter',
      'city_conqueror',
      'ascension_vanguard_5',
    ]));
    expect(meta.achievements.states.silent_tyrant_hunter.unlocked).toBe(true);
    expect(meta.achievements.states.city_conqueror.unlocked).toBe(true);
    expect(meta.achievements.states.ascension_vanguard_5.unlocked).toBe(true);
  });
});
