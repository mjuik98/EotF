import { ensureClassProgress } from './meta_persistence.js';
import { xpForLevel } from './xp_policy.js';

export function createPendingRunSummary({
  before,
  after,
  classId,
  outcome,
  rewards,
  totalGain,
  now = Date.now(),
}) {
  const levelUps = [];
  for (let lv = before.level + 1; lv <= after.level; lv += 1) {
    levelUps.push(lv);
  }

  return {
    outcome: outcome === 'victory' ? 'victory' : 'defeat',
    classId,
    rewards,
    totalGain,
    before,
    after,
    levelUps,
    ts: now,
  };
}

export function getDefaultClassState(classId) {
  return {
    classId,
    level: 1,
    totalXp: 0,
    currentLevelXp: 0,
    nextLevelXp: xpForLevel(2),
    progress: 0,
  };
}

export function peekPendingSummary(meta, classIds = []) {
  const cp = ensureClassProgress(meta, classIds);
  if (!cp || cp.pendingSummaries.length === 0) return null;
  return cp.pendingSummaries[0] || null;
}

export function consumePendingSummary(meta, classIds = []) {
  const cp = ensureClassProgress(meta, classIds);
  if (!cp || cp.pendingSummaries.length === 0) return null;
  return cp.pendingSummaries.shift() || null;
}
