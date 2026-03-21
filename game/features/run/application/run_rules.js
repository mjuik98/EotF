import { DATA } from '../../../../data/game_data.js';
import {
  ensureCodexRecords,
  ensureCodexState,
} from '../../../shared/codex/codex_record_state_use_case.js';
import { ClassProgressionSystem } from '../../title/ports/public_progression_capabilities.js';
import { CURSES } from '../domain/run_rules_curses.js';
import {
  getRegionCount,
  getBaseRegionIndex,
  getRegionIdForStage,
  getRegionData,
} from '../domain/run_rules_regions.js';
import {
  getAscension,
  isEndless,
  getDifficultyScore,
  getInscriptionScoreAdjustment,
  getRewardMultiplier,
  getEnemyScaleMultiplier,
  getHealAmount,
  getShopCost,
} from '../domain/run_rules_difficulty.js';
import { ensureRunMeta } from '../domain/run_rules_meta.js';
import {
  applyPlayerMaxHpPenalty,
  applyRunOutcomeRewards,
  applySilenceCurseTurnStart,
  beginRunOutcomeCommit,
  captureRunOutcomeTiming,
  recordDefeatProgress,
  recordVictoryProgress,
  syncRunOutcomeMeta,
} from '../state/run_outcome_state_commands.js';

export {
  getRegionCount,
  getBaseRegionIndex,
  getRegionIdForStage,
  getRegionData,
} from '../domain/run_rules_regions.js';

export const RunRules = {
  curses: CURSES,

  ensureMeta(meta) {
    ensureRunMeta(meta, {
      curses: this.curses,
      data: DATA,
      ensureCodexState,
      ensureCodexRecords,
      ensureClassProgressionMeta: (metaRef, classIds) => ClassProgressionSystem.ensureMeta(metaRef, classIds),
    });
  },

  getAscension(gs) {
    return getAscension(gs);
  },

  isEndless(gs) {
    return isEndless(gs);
  },

  getDifficultyScore(gs) {
    return getDifficultyScore(gs);
  },

  getInscriptionScoreAdjustment(gs) {
    return getInscriptionScoreAdjustment(gs);
  },

  getRewardMultiplier(gs) {
    return getRewardMultiplier(gs);
  },

  getEnemyScaleMultiplier(gs, regionAbs = 0) {
    return getEnemyScaleMultiplier(gs, regionAbs);
  },

  getHealAmount(gs, baseAmount) {
    return getHealAmount(gs, baseAmount);
  },

  getShopCost(gs, baseCost) {
    return getShopCost(gs, baseCost);
  },

  applyRunStart(gs) {
    if (!gs?.meta || !gs?.player) return;
    this.ensureMeta(gs.meta);
    const asc = this.getAscension(gs);
    const cfg = gs.runConfig || {};

    const ascHpLoss = Math.min(20, asc * 2);
    applyPlayerMaxHpPenalty(gs, ascHpLoss);

    const curse = cfg.curse || 'none';
    if (curse === 'frail') {
      applyPlayerMaxHpPenalty(gs, 10);
    }

    ClassProgressionSystem.applyRunStartBonuses(gs, {
      classIds: Object.keys(DATA?.classes || {}),
      data: DATA,
    });
  },

  onCombatStart(gs) {
    if (!gs?.player) return;
    ClassProgressionSystem.applyCombatStartBonuses(gs, {
      classIds: Object.keys(DATA?.classes || {}),
    });
  },

  onCombatDeckReady(gs) {
    if (!gs?.player) return;
    ClassProgressionSystem.applyDeckReadyBonuses(gs, {
      classIds: Object.keys(DATA?.classes || {}),
      data: DATA,
    });
  },

  onTurnStart(gs) {
    if (!gs?.player || !gs?.combat) return;

    if ((gs.runConfig?.curse || 'none') === 'silence') {
      applySilenceCurseTurnStart(gs);
    }
  },

  onCombatEnd(gs) {
    if (!gs?.player) return;

    if ((gs.runConfig?.curse || 'none') === 'decay') {
      applyPlayerMaxHpPenalty(gs, 2);
    }
  },

  onVictory(gs) {
    if (!gs?.meta) return 5;
    this.ensureMeta(gs.meta);
    return recordVictoryProgress(gs);
  },

  onDefeat(gs) {
    if (!gs?.meta) return 3;
    this.ensureMeta(gs.meta);
    return recordDefeatProgress(gs);
  },

  nextCurseId(current = 'none') {
    const ids = Object.keys(this.curses);
    const idx = Math.max(0, ids.indexOf(current));
    return ids[(idx + 1) % ids.length];
  },
};

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

export function finalizeRunOutcome(kind = 'defeat', options = {}, deps = {}) {
  const gs = resolveRunRulesState(deps);
  if (!gs) return 0;
  if (!beginRunOutcomeCommit(gs)) return 0;

  captureRunOutcomeTiming(gs);

  RunRules.ensureMeta(gs.meta);
  syncRunOutcomeMeta(gs);
  const isVictory = kind === 'victory';
  let shardGain = 0;
  if (Number.isFinite(options.echoFragments)) {
    shardGain = Math.max(0, Math.floor(options.echoFragments));
    if (isVictory) RunRules.onVictory(gs);
    else RunRules.onDefeat(gs);
  } else {
    shardGain = isVictory ? RunRules.onVictory(gs) : RunRules.onDefeat(gs);
  }

  try {
    ClassProgressionSystem.awardRunXP(gs, kind, {
      ...options,
      classIds: Object.keys(DATA?.classes || {}),
      regionCount: getRegionCount(),
    });
  } catch (e) {
    console.warn('[RunRules] Class progression update failed:', e?.message || e);
  }

  applyRunOutcomeRewards(gs, shardGain);
  persistRunOutcomeMeta(deps);

  return shardGain;
}
