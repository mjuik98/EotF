import { ACHIEVEMENTS } from '../domain/achievement_definitions.js';
import { applyContentUnlockRewards } from './apply_content_unlock_rewards.js';
import { getAchievementProgressValue } from '../domain/achievement_progress_queries.js';

function isAchievementSatisfied(meta, definition, context = {}) {
  switch (definition?.condition?.type) {
    case 'victories': {
      if (getAchievementProgressValue(meta, definition.condition) < definition.condition.count) return false;
      return context.kind ? context.kind === 'victory' : true;
    }
    case 'cursed_victories': {
      if (getAchievementProgressValue(meta, definition.condition) < definition.condition.count) return false;
      if (context.kind && context.kind !== 'victory') return false;
      if (!('runConfig' in context)) return true;
      return !!context.runConfig?.curse && context.runConfig.curse !== 'none';
    }
    case 'failures': {
      if (getAchievementProgressValue(meta, definition.condition) < definition.condition.count) return false;
      if (!context.kind) return true;
      return context.kind !== 'victory';
    }
    case 'story_pieces':
    case 'codex_entries':
    case 'best_chain':
      return getAchievementProgressValue(meta, definition.condition) >= definition.condition.count;
    case 'world_memory_count': {
      const key = String(definition?.condition?.key || '');
      if (!key) return false;
      return getAchievementProgressValue(meta, definition.condition) >= definition.condition.count;
    }
    case 'class_level':
    case 'boss_kills':
    case 'region_victories':
    case 'highest_ascension_victory':
      return getAchievementProgressValue(meta, definition.condition) >= definition.condition.count;
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

    const existingState = states[definition.id];
    if (existingState?.unlocked) continue;
    if (!isAchievementSatisfied(meta, definition, context)) continue;

    const state = existingState || { unlocked: false, progress: 0 };
    states[definition.id] = state;
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
