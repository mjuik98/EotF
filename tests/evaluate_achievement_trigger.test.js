import { describe, expect, it } from 'vitest';

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
      progress: { victories: 2, bossKills: {} },
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
      progress: { victories: 4, bossKills: {} },
    };

    reconcileMetaProgression(meta);

    expect(meta.achievements.states.first_victory.unlocked).toBe(true);
    expect(meta.contentUnlocks.curses.blood_moon.unlocked).toBe(true);
  });
});
