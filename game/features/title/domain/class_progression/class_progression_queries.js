import {
  getClassMasteryRoadmap,
  MAX_CLASS_MASTERY_LEVEL,
} from '../../../../shared/progression/class_progression_data_use_case.js';
import { ensureClassProgress } from './meta_persistence.js';
import { consumePendingSummary, peekPendingSummary } from './pending_summary_store.js';
import { resolveMasteryBonuses } from './runtime_apply.js';
import { calcLevel, calcProgress, toClassIds, toNonNegativeInt, xpForLevel } from './xp_policy.js';

export const CLASS_MASTERY_MAX_LEVEL = MAX_CLASS_MASTERY_LEVEL;

export function ensureClassProgressMeta(meta, classIds = []) {
  return ensureClassProgress(meta, classIds);
}

export function getClassProgressState(meta, classId, classIds = []) {
  if (!meta || !classId) return null;
  const cp = ensureClassProgress(meta, classIds);
  if (!cp) return null;

  const rawXp = toNonNegativeInt(cp.xp[classId], 0);
  const level = calcLevel(rawXp);
  cp.levels[classId] = level;
  cp.xp[classId] = rawXp;

  return {
    classId,
    level,
    totalXp: rawXp,
    currentLevelXp: xpForLevel(level),
    nextLevelXp: level >= CLASS_MASTERY_MAX_LEVEL ? null : xpForLevel(level + 1),
    progress: calcProgress(level, rawXp),
  };
}

export function getClassActiveBonuses(meta, classId, classIds = []) {
  const state = getClassProgressState(meta, classId, classIds);
  if (!state) return null;
  return resolveMasteryBonuses(classId, state.level);
}

export function getRewardRelicChoiceBonus(gs, options = {}) {
  const direct = toNonNegativeInt(gs?.player?._classMasteryRelicChoiceBonus, 0);
  if (direct > 0) return direct;

  if (!gs?.meta || !gs?.player?.class) return 0;
  const classIds = toClassIds(options.classIds || []);
  const bonuses = getClassActiveBonuses(gs.meta, String(gs.player.class), classIds);
  return toNonNegativeInt(bonuses?.reward?.extraRelicChoices, 0);
}

export function getClassRoadmap(classId) {
  return getClassMasteryRoadmap(classId);
}

export function peekClassPendingSummary(meta, classIds = []) {
  return peekPendingSummary(meta, classIds);
}

export function consumeClassPendingSummary(meta, classIds = []) {
  return consumePendingSummary(meta, classIds);
}

export function getClassPendingSummaryCount(meta, classId, classIds = []) {
  const cp = ensureClassProgress(meta, classIds);
  if (!cp) return 0;

  const pendingSummaries = Array.isArray(cp.pendingSummaries) ? cp.pendingSummaries : [];
  if (!classId) return pendingSummaries.length;
  return pendingSummaries.filter((summary) => summary?.classId === classId).length;
}

export function getClassRecentSummaries(meta, classId, classIds = [], limit = 3) {
  if (!meta || !classId) return [];
  const cp = ensureClassProgress(meta, classIds);
  if (!cp) return [];

  return (cp.recentSummaries || [])
    .filter((summary) => summary?.classId === classId)
    .slice(-Math.max(0, Number(limit) || 0))
    .reverse();
}
