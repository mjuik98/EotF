import { CURSES } from '../domain/run_rules_curses.js';
import {
  getRegionCount,
  getBaseRegionIndex,
  getRegionIdForStage,
  getRegionData,
} from '../domain/run_rules_regions.js';
import {
  getAscension,
  getDifficultyScore,
  getInscriptionScoreAdjustment,
  getRewardMultiplier,
  getEnemyScaleMultiplier,
  getHealAmount,
  getShopCost,
  isEndless,
} from './run_rule_scaling.js';
import {
  applyCombatDeckReadyEffects,
  applyCombatEndEffects,
  applyCombatStartEffects,
  applyRunStartEffects,
  applyTurnStartEffects,
} from './run_rule_lifecycle.js';
import { ensureRunRuleMeta } from './run_rule_meta.js';
import {
  finalizeRunOutcome,
  recordRunDefeat,
  recordRunVictory,
} from './run_rule_outcome.js';

export {
  getRegionCount,
  getBaseRegionIndex,
  getRegionIdForStage,
  getRegionData,
} from '../domain/run_rules_regions.js';

export const RunRules = {
  curses: CURSES,

  ensureMeta(meta) {
    ensureRunRuleMeta(meta, {
      curses: this.curses,
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

  getShopCost(gs, baseCost, options = {}) {
    return getShopCost(gs, baseCost, options);
  },

  applyRunStart(gs) {
    applyRunStartEffects(gs, {
      curses: this.curses,
      ensureMeta: (meta) => this.ensureMeta(meta),
      getAscension: (state) => this.getAscension(state),
    });
  },

  onCombatStart(gs) {
    applyCombatStartEffects(gs);
  },

  onCombatDeckReady(gs) {
    applyCombatDeckReadyEffects(gs);
  },

  onTurnStart(gs) {
    applyTurnStartEffects(gs);
  },

  onCombatEnd(gs) {
    applyCombatEndEffects(gs);
  },

  onVictory(gs) {
    return recordRunVictory(gs);
  },

  onDefeat(gs) {
    return recordRunDefeat(gs);
  },

  nextCurseId(current = 'none') {
    const ids = Object.keys(this.curses);
    const idx = Math.max(0, ids.indexOf(current));
    return ids[(idx + 1) % ids.length];
  },
};
export { finalizeRunOutcome };
