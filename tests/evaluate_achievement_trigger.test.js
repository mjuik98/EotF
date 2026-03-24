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
});
