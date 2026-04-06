import { DATA } from '../ports/public_data_runtime_capabilities.js';
import { CURSES } from '../domain/run_rules_curses.js';
import { getRegionCount } from '../domain/run_region_rule_queries.js';
import { Logger } from '../../../shared/logging/public.js';
import { resolveRunOutcomeExternalPorts } from './run_outcome_external_ports.js';
import { ensureRunRuleMeta, resolveRunRuleClassIds } from './run_rule_meta.js';
import {
  applyRunOutcomeRewards,
  beginRunOutcomeCommit,
  captureRunOutcomeTiming,
  recordDefeatProgress,
  recordVictoryProgress,
  syncRunOutcomeMeta,
} from '../state/run_outcome_state_commands.js';
import { createRecentRunSummary, recordRecentRun } from '../domain/recent_run_history.js';
import { recordRunAnalytics } from '../domain/run_analytics.js';

const RunRulesLogger = Logger.child('RunRules');

function ensureOutcomeMeta(meta) {
  ensureRunRuleMeta(meta, { curses: CURSES });
}

function resolveRunRulesState(deps = {}) {
  if (deps.gs) return deps.gs;
  if (typeof deps.getGameState === 'function') return deps.getGameState();
  return null;
}

function publishProgressionUnlocks(gs, progressionResult, kind, deps = {}) {
  gs.runOutcomeUnlocks = Array.isArray(progressionResult?.newlyUnlockedContent)
    ? progressionResult.newlyUnlockedContent.slice()
    : [];
  gs.runOutcomeAchievements = Array.isArray(progressionResult?.newlyUnlockedAchievements)
    ? progressionResult.newlyUnlockedAchievements.slice()
    : [];

  if ((!gs.runOutcomeUnlocks.length && !gs.runOutcomeAchievements.length) || typeof deps.onProgressionUnlocked !== 'function') return;
  deps.onProgressionUnlocked(gs.runOutcomeUnlocks, {
    kind,
    gs,
    newlyUnlockedAchievements: gs.runOutcomeAchievements,
  });
}

export function recordRunVictory(gs) {
  if (!gs?.meta) return 5;
  ensureOutcomeMeta(gs.meta);
  return recordVictoryProgress(gs);
}

export function recordRunDefeat(gs) {
  if (!gs?.meta) return 3;
  ensureOutcomeMeta(gs.meta);
  return recordDefeatProgress(gs);
}

export function finalizeRunOutcome(kind = 'defeat', options = {}, deps = {}) {
  const gs = resolveRunRulesState(deps);
  if (!gs) return 0;
  if (!beginRunOutcomeCommit(gs)) return 0;
  const externalPorts = resolveRunOutcomeExternalPorts(deps);

  captureRunOutcomeTiming(gs);
  ensureOutcomeMeta(gs.meta);
  syncRunOutcomeMeta(gs);

  const isVictory = kind === 'victory';
  let shardGain = 0;
  if (Number.isFinite(options.echoFragments)) {
    shardGain = Math.max(0, Math.floor(options.echoFragments));
    if (isVictory) recordRunVictory(gs);
    else recordRunDefeat(gs);
  } else {
    shardGain = isVictory ? recordRunVictory(gs) : recordRunDefeat(gs);
  }

  try {
    externalPorts.awardRunXp(gs, kind, {
      ...options,
      classIds: resolveRunRuleClassIds(DATA),
      regionCount: getRegionCount(),
    });
  } catch (e) {
    RunRulesLogger.warn('Class progression update failed:', e?.message || e);
  }

  const progressionResult = externalPorts.evaluateAchievements(gs.meta, 'run_completed', {
    kind,
    runConfig: gs.runConfig,
  });
  publishProgressionUnlocks(gs, progressionResult, kind, deps);
  const recentRunSummary = createRecentRunSummary(gs, kind, progressionResult);
  recordRecentRun(gs.meta, recentRunSummary);
  recordRunAnalytics(gs.meta, recentRunSummary);

  applyRunOutcomeRewards(gs, shardGain);
  externalPorts.persistMeta({ ...deps, gs });

  return shardGain;
}
