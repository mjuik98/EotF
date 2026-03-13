import { MAX_CLASS_MASTERY_LEVEL } from '../../../../shared/progression/class_progression_data_use_case.js';
import { toClassIds, toNonNegativeInt, xpForLevel } from './xp_policy.js';

export function ensureClassProgress(meta, classIds = []) {
  if (!meta || typeof meta !== 'object') return null;
  if (!meta.classProgress || typeof meta.classProgress !== 'object' || Array.isArray(meta.classProgress)) {
    meta.classProgress = {};
  }
  const cp = meta.classProgress;

  if (!cp.levels || typeof cp.levels !== 'object' || Array.isArray(cp.levels)) cp.levels = {};
  if (!cp.xp || typeof cp.xp !== 'object' || Array.isArray(cp.xp)) cp.xp = {};
  if (!Array.isArray(cp.pendingSummaries)) cp.pendingSummaries = [];

  const ids = toClassIds(classIds);
  ids.forEach((classId) => {
    const level = toNonNegativeInt(cp.levels[classId], 1);
    const normalizedLevel = Math.max(1, Math.min(MAX_CLASS_MASTERY_LEVEL, level || 1));
    cp.levels[classId] = normalizedLevel;

    const xp = toNonNegativeInt(cp.xp[classId], 0);
    cp.xp[classId] = Math.max(xp, xpForLevel(normalizedLevel));
  });

  return cp;
}
