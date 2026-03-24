import { DATA } from '../ports/public_data_runtime_capabilities.js';
import { CURSES } from '../domain/run_rules_curses.js';
import { getRegionCount } from '../domain/run_rules_regions.js';
import { evaluateAchievementTrigger } from '../../meta_progression/application/evaluate_achievement_trigger.js';
import { ClassProgressionSystem } from '../../title/ports/public_progression_capabilities.js';
import { ensureRunRuleMeta, resolveRunRuleClassIds } from './run_rule_meta.js';
import {
  applyRunOutcomeRewards,
  beginRunOutcomeCommit,
  captureRunOutcomeTiming,
  recordDefeatProgress,
  recordVictoryProgress,
  syncRunOutcomeMeta,
} from '../state/run_outcome_state_commands.js';

function ensureOutcomeMeta(meta) {
  ensureRunRuleMeta(meta, { curses: CURSES });
}

function resolveRunRulesState(deps = {}) {
  if (deps.gs) return deps.gs;
  if (typeof deps.getGameState === 'function') return deps.getGameState();
  return null;
}

function persistRunOutcomeMeta(deps = {}) {
  const saveSystem = deps.saveSystem;
  saveSystem?.saveMeta?.();
  saveSystem?.clearSave?.();
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
    ClassProgressionSystem.awardRunXP(gs, kind, {
      ...options,
      classIds: resolveRunRuleClassIds(DATA),
      regionCount: getRegionCount(),
    });
  } catch (e) {
    console.warn('[RunRules] Class progression update failed:', e?.message || e);
  }

  evaluateAchievementTrigger(gs.meta, 'run_completed', {
    kind,
    runConfig: gs.runConfig,
  });

  applyRunOutcomeRewards(gs, shardGain);
  persistRunOutcomeMeta(deps);

  return shardGain;
}
