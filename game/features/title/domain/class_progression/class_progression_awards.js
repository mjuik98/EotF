import { ensureClassProgress, MAX_RECENT_SUMMARIES } from './meta_persistence.js';
import { buildRunRewards } from './reward_calculator.js';
import { createPendingRunSummary, getDefaultClassState } from './pending_summary_store.js';
import { toClassIds, toNonNegativeInt } from './xp_policy.js';
import { getClassProgressState } from './class_progression_queries.js';

export function awardRunXP(gs, outcome = 'defeat', options = {}) {
  if (!gs?.meta || !gs?.player?.class) return null;

  const classIds = toClassIds(options.classIds || []);
  const cp = ensureClassProgress(gs.meta, classIds);
  if (!cp) return null;

  const classId = String(gs.player.class);
  const before = getClassProgressState(gs.meta, classId, classIds) || getDefaultClassState(classId);

  const rewards = buildRunRewards(gs, outcome, options);
  const totalGain = rewards.reduce((sum, row) => sum + toNonNegativeInt(row?.xp, 0), 0);
  const afterTotalXp = toNonNegativeInt(before.totalXp, 0) + totalGain;
  cp.xp[classId] = afterTotalXp;

  const after = getClassProgressState(gs.meta, classId, classIds);
  if (!after) return null;

  const summary = createPendingRunSummary({
    before,
    after,
    classId,
    outcome,
    rewards,
    totalGain,
  });

  cp.pendingSummaries.push(summary);
  cp.recentSummaries.push(summary);
  if (cp.recentSummaries.length > MAX_RECENT_SUMMARIES) {
    cp.recentSummaries = cp.recentSummaries.slice(-MAX_RECENT_SUMMARIES);
  }
  return summary;
}
