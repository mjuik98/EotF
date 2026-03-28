function toNonNegativeInt(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.floor(number));
}

function toOutcomeKey(outcome) {
  const value = String(outcome || 'defeat');
  if (value === 'victory' || value === 'defeat' || value === 'abandon') return value;
  return 'defeat';
}

function toOutcomeCounterKey(outcome) {
  const key = toOutcomeKey(outcome);
  if (key === 'victory') return 'victories';
  if (key === 'abandon') return 'abandons';
  return 'defeats';
}

function roundToTenth(value) {
  return Number((Number(value || 0)).toFixed(1));
}

const OUTCOME_LABELS = Object.freeze({
  victory: '승리',
  defeat: '패배',
  abandon: '중단',
});

function createTotals(overrides = {}) {
  return {
    runs: toNonNegativeInt(overrides.runs, 0),
    victories: toNonNegativeInt(overrides.victories, 0),
    defeats: toNonNegativeInt(overrides.defeats, 0),
    abandons: toNonNegativeInt(overrides.abandons, 0),
    kills: toNonNegativeInt(overrides.kills, 0),
    floors: toNonNegativeInt(overrides.floors, 0),
    clearTimeMs: toNonNegativeInt(overrides.clearTimeMs, 0),
    storyCount: toNonNegativeInt(overrides.storyCount, 0),
    unlockCount: toNonNegativeInt(overrides.unlockCount, 0),
    achievementCount: toNonNegativeInt(overrides.achievementCount, 0),
  };
}

function createClassSummary(classId, overrides = {}) {
  return {
    classId: String(classId || ''),
    runs: toNonNegativeInt(overrides.runs, 0),
    victories: toNonNegativeInt(overrides.victories, 0),
    defeats: toNonNegativeInt(overrides.defeats, 0),
    abandons: toNonNegativeInt(overrides.abandons, 0),
    kills: toNonNegativeInt(overrides.kills, 0),
    floors: toNonNegativeInt(overrides.floors, 0),
    bestFloor: toNonNegativeInt(overrides.bestFloor, 0),
  };
}

export function createRunAnalyticsState(overrides = {}) {
  const classes = Object.fromEntries(
    Object.entries(overrides.classes || {}).map(([classId, summary]) => [
      classId,
      createClassSummary(classId, summary),
    ]),
  );

  return {
    totals: createTotals(overrides.totals),
    classes,
  };
}

export function ensureRunAnalytics(meta) {
  if (!meta || typeof meta !== 'object') return createRunAnalyticsState();
  meta.analytics = createRunAnalyticsState(meta.analytics);
  return meta.analytics;
}

export function recordRunAnalytics(meta, summary = {}) {
  const analytics = ensureRunAnalytics(meta);
  const outcomeCounterKey = toOutcomeCounterKey(summary.outcome);
  const classId = String(summary.classId || '');

  analytics.totals.runs += 1;
  analytics.totals[outcomeCounterKey] += 1;
  analytics.totals.kills += toNonNegativeInt(summary.kills, 0);
  analytics.totals.floors += toNonNegativeInt(summary.floor, 0);
  analytics.totals.clearTimeMs += toNonNegativeInt(summary.clearTimeMs, 0);
  analytics.totals.storyCount += toNonNegativeInt(summary.storyCount, 0);
  analytics.totals.unlockCount += toNonNegativeInt(summary.unlockCount, 0);
  analytics.totals.achievementCount += toNonNegativeInt(summary.achievementCount, 0);

  if (!classId) return analytics;

  if (!analytics.classes[classId]) {
    analytics.classes[classId] = createClassSummary(classId);
  }

  const classSummary = analytics.classes[classId];
  classSummary.runs += 1;
  classSummary[outcomeCounterKey] += 1;
  classSummary.kills += toNonNegativeInt(summary.kills, 0);
  classSummary.floors += toNonNegativeInt(summary.floor, 0);
  classSummary.bestFloor = Math.max(classSummary.bestFloor, toNonNegativeInt(summary.floor, 0));

  return analytics;
}

function buildFallbackAnalyticsFromRecentRuns(meta = {}) {
  const scratchMeta = { analytics: createRunAnalyticsState() };
  const recentRuns = Array.isArray(meta?.recentRuns) ? meta.recentRuns : [];
  recentRuns.forEach((entry) => recordRunAnalytics(scratchMeta, entry));
  return scratchMeta.analytics;
}

function pickFavoriteClass(classEntries = []) {
  return classEntries
    .slice()
    .sort((left, right) => (
      (right.runs - left.runs)
      || (right.victories - left.victories)
      || left.classId.localeCompare(right.classId)
    ))[0] || null;
}

function pickBestClass(classEntries = []) {
  return classEntries
    .filter((entry) => entry.runs > 0)
    .slice()
    .sort((left, right) => {
      const leftRate = left.victories / left.runs;
      const rightRate = right.victories / right.runs;
      return (
        (rightRate - leftRate)
        || (right.victories - left.victories)
        || (right.runs - left.runs)
        || left.classId.localeCompare(right.classId)
      );
    })[0] || null;
}

function buildRecentOutcomeLabels(meta = {}) {
  const recentRuns = Array.isArray(meta?.recentRuns) ? meta.recentRuns.slice(-5) : [];
  return recentRuns.map((entry) => OUTCOME_LABELS[toOutcomeKey(entry?.outcome)] || '기록');
}

function buildCurrentStreak(meta = {}) {
  const recentRuns = Array.isArray(meta?.recentRuns) ? meta.recentRuns : [];
  const reversed = recentRuns.slice().reverse();
  if (reversed.length === 0) {
    return { outcome: '', count: 0 };
  }

  const outcome = toOutcomeKey(reversed[0]?.outcome);
  let count = 0;
  for (const entry of reversed) {
    if (toOutcomeKey(entry?.outcome) !== outcome) break;
    count += 1;
  }

  return { outcome, count };
}

export function buildRunAnalyticsSnapshot(meta = {}) {
  const analytics = meta?.analytics?.totals?.runs
    ? createRunAnalyticsState(meta.analytics)
    : buildFallbackAnalyticsFromRecentRuns(meta);
  const totals = analytics.totals;
  const classEntries = Object.values(analytics.classes || {});
  const favoriteClass = pickFavoriteClass(classEntries);
  const bestClass = pickBestClass(classEntries);
  const recentOutcomeLabels = buildRecentOutcomeLabels(meta);
  const currentStreak = buildCurrentStreak(meta);
  const classBreakdown = classEntries
    .slice()
    .sort((left, right) => (
      (right.runs - left.runs)
      || (right.victories - left.victories)
      || left.classId.localeCompare(right.classId)
    ))
    .map((entry) => ({
      classId: entry.classId,
      runs: entry.runs,
      winRate: entry.runs > 0 ? Math.round((entry.victories / entry.runs) * 100) : 0,
      avgFloor: entry.runs > 0 ? roundToTenth(entry.floors / entry.runs) : 0,
      bestFloor: entry.bestFloor,
    }));

  return {
    totalRuns: totals.runs,
    winRate: totals.runs > 0 ? Math.round((totals.victories / totals.runs) * 100) : 0,
    avgFloor: totals.runs > 0 ? roundToTenth(totals.floors / totals.runs) : 0,
    avgKills: totals.runs > 0 ? roundToTenth(totals.kills / totals.runs) : 0,
    favoriteClassId: favoriteClass?.classId || '',
    favoriteClassRuns: favoriteClass?.runs || 0,
    bestClassId: bestClass?.classId || '',
    bestClassRuns: bestClass?.runs || 0,
    bestClassWinRate: bestClass?.runs ? Math.round((bestClass.victories / bestClass.runs) * 100) : 0,
    currentStreakOutcome: currentStreak.outcome,
    currentStreakCount: currentStreak.count,
    recentOutcomeLabels,
    classBreakdown,
  };
}
