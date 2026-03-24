import { evaluateAchievementTrigger } from './evaluate_achievement_trigger.js';

export function reconcileMetaProgression(meta) {
  const unlocked = [];

  if (Number(meta?.progress?.victories || 0) > 0) {
    unlocked.push(
      ...evaluateAchievementTrigger(meta, 'run_completed', {
        kind: 'victory',
        runConfig: { curse: 'none' },
      }).newlyUnlockedAchievements,
    );
  }

  return unlocked;
}
