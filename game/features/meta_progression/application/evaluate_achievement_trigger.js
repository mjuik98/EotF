import { ACHIEVEMENTS } from '../domain/achievement_definitions.js';
import { applyContentUnlockRewards } from './apply_content_unlock_rewards.js';

function isAchievementSatisfied(meta, definition, context = {}) {
  switch (definition?.condition?.type) {
    case 'victories':
      return Number(meta?.progress?.victories || 0) >= definition.condition.count && context.kind === 'victory';
    case 'cursed_victories':
      return context.kind === 'victory' && context.runConfig?.curse && context.runConfig.curse !== 'none';
    default:
      return false;
  }
}

export function evaluateAchievementTrigger(meta, trigger, context = {}) {
  const states = meta?.achievements?.states;
  if (!meta || !states) {
    return { newlyUnlockedAchievements: [], newlyUnlockedContent: [] };
  }

  const newlyUnlockedAchievements = [];
  const newlyUnlockedContent = [];

  for (const definition of Object.values(ACHIEVEMENTS)) {
    if (definition.trigger !== trigger) continue;

    const state = states[definition.id] || { unlocked: false, progress: 0 };
    states[definition.id] = state;
    if (state.unlocked) continue;
    if (!isAchievementSatisfied(meta, definition, context)) continue;

    state.unlocked = true;
    state.unlockedAt = Date.now();
    state.progress = definition.condition.count;
    newlyUnlockedAchievements.push(definition.id);
    newlyUnlockedContent.push(
      ...applyContentUnlockRewards(meta, definition.rewards, definition.id, state.unlockedAt),
    );
  }

  return { newlyUnlockedAchievements, newlyUnlockedContent };
}
