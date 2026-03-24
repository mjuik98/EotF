import { evaluateAchievementTrigger } from './evaluate_achievement_trigger.js';
import { ACHIEVEMENTS } from '../domain/achievement_definitions.js';

export function reconcileMetaProgression(meta) {
  const unlocked = [];
  const triggers = new Set(
    Object.values(ACHIEVEMENTS)
      .map((definition) => definition?.trigger)
      .filter(Boolean),
  );

  for (const trigger of triggers) {
    unlocked.push(
      ...evaluateAchievementTrigger(meta, trigger, {}).newlyUnlockedAchievements,
    );
  }

  return unlocked;
}
