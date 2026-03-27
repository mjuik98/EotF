import {
  CLASS_MASTERY_MAX_LEVEL,
  consumeClassPendingSummary,
  ensureClassProgressMeta,
  getClassActiveBonuses,
  getClassPendingSummaryCount,
  getClassRecentSummaries,
  getClassProgressState,
  getClassRoadmap,
  getRewardRelicChoiceBonus,
  peekClassPendingSummary,
} from './class_progression/class_progression_queries.js';
import {
  applyCombatStartBonuses,
  applyDeckReadyBonuses,
  applyRunStartBonuses,
  refreshRuntimeBonuses,
} from './class_progression/class_progression_runtime_effects.js';
import { awardRunXP } from './class_progression/class_progression_awards.js';

export const ClassProgressionSystem = {
  MAX_LEVEL: CLASS_MASTERY_MAX_LEVEL,

  ensureMeta(meta, classIds = []) {
    ensureClassProgressMeta(meta, classIds);
  },

  getClassState(meta, classId, classIds = []) {
    return getClassProgressState(meta, classId, classIds);
  },

  getActiveBonuses(meta, classId, classIds = []) {
    return getClassActiveBonuses(meta, classId, classIds);
  },

  refreshRuntimeBonuses(gs, options = {}) {
    return refreshRuntimeBonuses(gs, options);
  },

  applyRunStartBonuses(gs, options = {}) {
    return applyRunStartBonuses(gs, options);
  },

  applyCombatStartBonuses(gs, options = {}) {
    return applyCombatStartBonuses(gs, options);
  },

  applyDeckReadyBonuses(gs, options = {}) {
    return applyDeckReadyBonuses(gs, options);
  },

  getRewardRelicChoiceBonus(gs, options = {}) {
    return getRewardRelicChoiceBonus(gs, options);
  },

  getRoadmap(classId) {
    return getClassRoadmap(classId);
  },

  getRecentSummaries(meta, classId, classIds = [], limit = 3) {
    return getClassRecentSummaries(meta, classId, classIds, limit);
  },

  getPendingSummaryCount(meta, classId, classIds = []) {
    return getClassPendingSummaryCount(meta, classId, classIds);
  },

  awardRunXP(gs, outcome = 'defeat', options = {}) {
    return awardRunXP(gs, outcome, options);
  },

  peekPendingSummary(meta, classIds = []) {
    return peekClassPendingSummary(meta, classIds);
  },

  consumePendingSummary(meta, classIds = []) {
    return consumeClassPendingSummary(meta, classIds);
  },
};
