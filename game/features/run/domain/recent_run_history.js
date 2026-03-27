export const MAX_RECENT_RUNS = 10;

function cloneStringArray(value) {
  return Array.isArray(value) ? value.map((entry) => String(entry)) : [];
}

function toNonNegativeInt(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.floor(number));
}

function cloneRecentRunEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  return {
    runNumber: toNonNegativeInt(entry.runNumber, 0),
    outcome: String(entry.outcome || 'defeat'),
    classId: String(entry.classId || ''),
    region: toNonNegativeInt(entry.region, 0),
    floor: toNonNegativeInt(entry.floor, 0),
    ascension: toNonNegativeInt(entry.ascension, 0),
    endless: !!entry.endless,
    curseId: String(entry.curseId || 'none'),
    maxChain: toNonNegativeInt(entry.maxChain, 0),
    clearTimeMs: toNonNegativeInt(entry.clearTimeMs, 0),
    storyCount: toNonNegativeInt(entry.storyCount, 0),
    unlockCount: toNonNegativeInt(entry.unlockCount, 0),
    achievementCount: toNonNegativeInt(entry.achievementCount, 0),
    kills: toNonNegativeInt(entry.kills, 0),
    milestones: cloneStringArray(entry.milestones).slice(0, 3),
    timestamp: toNonNegativeInt(entry.timestamp, 0),
  };
}

function buildRecentRunMilestones(gs, progressionResult = {}) {
  const milestones = [];
  const maxChain = toNonNegativeInt(gs?.stats?.maxChain, 0);
  const ascension = toNonNegativeInt(gs?.runConfig?.ascension, 0);
  if (ascension >= 5) milestones.push('상위 승천');
  if (gs?.worldMemory?.surveyorsRequiemSeen) milestones.push('조사 완결');
  else if (gs?.worldMemory?.routeTriangulated) milestones.push('항로 개척');
  if (maxChain >= 12) milestones.push(`연쇄 ${maxChain}`);
  if (Array.isArray(progressionResult?.newlyUnlockedAchievements) && progressionResult.newlyUnlockedAchievements.length > 0) {
    milestones.push(`업적 ${progressionResult.newlyUnlockedAchievements.length}`);
  }
  return milestones.slice(0, 3);
}

export function ensureRecentRuns(meta) {
  if (!meta || typeof meta !== 'object') return [];
  const recentRuns = Array.isArray(meta.recentRuns)
    ? meta.recentRuns.map(cloneRecentRunEntry).filter(Boolean).slice(-MAX_RECENT_RUNS)
    : [];
  meta.recentRuns = recentRuns;
  return recentRuns;
}

export function createRecentRunSummary(gs, kind = 'defeat', progressionResult = {}, now = Date.now()) {
  return {
    runNumber: toNonNegativeInt(gs?.meta?.runCount, 1),
    outcome: String(kind || 'defeat'),
    classId: String(gs?.player?.class || ''),
    region: toNonNegativeInt(gs?.currentRegion, 0),
    floor: toNonNegativeInt(gs?.currentFloor, 1),
    ascension: toNonNegativeInt(gs?.runConfig?.ascension, 0),
    endless: !!gs?.runConfig?.endless,
    curseId: String(gs?.runConfig?.curse || 'none'),
    maxChain: toNonNegativeInt(gs?.stats?.maxChain, 0),
    clearTimeMs: toNonNegativeInt(gs?.stats?.clearTimeMs, 0),
    storyCount: Array.isArray(gs?.meta?.storyPieces) ? gs.meta.storyPieces.length : 0,
    unlockCount: Array.isArray(progressionResult?.newlyUnlockedContent) ? progressionResult.newlyUnlockedContent.length : 0,
    achievementCount: Array.isArray(progressionResult?.newlyUnlockedAchievements) ? progressionResult.newlyUnlockedAchievements.length : 0,
    kills: toNonNegativeInt(gs?.player?.kills, 0),
    milestones: buildRecentRunMilestones(gs, progressionResult),
    timestamp: toNonNegativeInt(now, 0),
  };
}

export function recordRecentRun(meta, summary) {
  const recentRuns = ensureRecentRuns(meta);
  const normalized = cloneRecentRunEntry(summary);
  if (!normalized) return recentRuns;
  recentRuns.push(normalized);
  meta.recentRuns = recentRuns.slice(-MAX_RECENT_RUNS);
  return meta.recentRuns;
}
