import { DATA } from '../../data/game_data.js';
import { GAME } from '../core/global_bridge.js';
import { ClassProgressionSystem } from './class_progression_system.js';
import { ensureCodexRecords, ensureCodexState } from './codex_records_system.js';
import { CURSES } from './run_rules_curses.js';
import {
  getRegionCount,
  getBaseRegionIndex,
  getRegionIdForStage,
  getRegionData,
} from './run_rules_regions.js';
import {
  getAscension,
  isEndless,
  getDifficultyScore,
  getInscriptionScoreAdjustment,
  getRewardMultiplier,
  getEnemyScaleMultiplier,
  getHealAmount,
  getShopCost,
} from './run_rules_difficulty.js';
import { ensureRunMeta } from './run_rules_meta.js';

export {
  getRegionCount,
  getBaseRegionIndex,
  getRegionIdForStage,
  getRegionData,
} from './run_rules_regions.js';

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
    if (ascHpLoss > 0) {
      gs.player.maxHp = Math.max(1, gs.player.maxHp - ascHpLoss);
      gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
    }

    const curse = cfg.curse || 'none';
    if (curse === 'frail') {
      gs.player.maxHp = Math.max(1, gs.player.maxHp - 10);
      gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
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
      if (gs.combat.turn <= 3) {
        gs.player.energy = Math.min(gs.player.energy, 1);
        gs.player.maxEnergy = Math.min(gs.player.maxEnergy, 1);
      } else if (gs.combat.turn === 4) {
        gs.player.maxEnergy = Math.max(gs.player.maxEnergy, 3);
      }
    }
  },

  onCombatEnd(gs) {
    if (!gs?.player) return;

    if ((gs.runConfig?.curse || 'none') === 'decay') {
      gs.player.maxHp = Math.max(1, gs.player.maxHp - 2);
      gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
    }
  },

  onVictory(gs) {
    if (!gs?.meta) return 5;
    this.ensureMeta(gs.meta);

    gs.meta.unlocks.ascension = true;
    gs.meta.progress.victories = (gs.meta.progress.victories || 0) + 1;
    gs.meta.progress.echoShards = (gs.meta.progress.echoShards || 0) + 2;
    gs.meta.maxAscension = Math.max(gs.meta.maxAscension || 0, Math.min(20, gs.meta.progress.victories));

    if (gs.meta.progress.victories >= 3) {
      gs.meta.unlocks.endless = true;
    }
    return 5;
  },

  onDefeat(gs) {
    if (!gs?.meta) return 3;
    this.ensureMeta(gs.meta);
    gs.meta.progress.failures = (gs.meta.progress.failures || 0) + 1;
    return 3;
  },

  nextCurseId(current = 'none') {
    const ids = Object.keys(this.curses);
    const idx = Math.max(0, ids.indexOf(current));
    return ids[(idx + 1) % ids.length];
  },
};

export function finalizeRunOutcome(kind = 'defeat', options = {}) {
  const gs = GAME.State;
  if (!gs) return 0;
  if (gs._runOutcomeCommitted) return 0;
  gs._runOutcomeCommitted = true;

  if (gs.stats && typeof gs.stats === 'object') {
    const now = Date.now();
    const runStartTs = Number(gs.stats._runStartTs);
    if (Number.isFinite(runStartTs) && runStartTs > 0) {
      gs.stats.clearTimeMs = Math.max(0, now - runStartTs);
    }

    if (!gs.stats.regionClearTimes || typeof gs.stats.regionClearTimes !== 'object' || Array.isArray(gs.stats.regionClearTimes)) {
      gs.stats.regionClearTimes = {};
    }
    const regionIndex = Math.max(0, Math.floor(Number(gs.currentRegion) || 0));
    const regionStartTs = Number(gs.stats._regionStartTs);
    if (Number.isFinite(regionStartTs) && regionStartTs > 0) {
      gs.stats.regionClearTimes[regionIndex] = Math.max(0, now - regionStartTs);
    }
  }

  RunRules.ensureMeta(gs.meta);
  Object.assign(gs.meta.worldMemory, gs.worldMemory || {});
  gs.meta.bestChain = Math.max(gs.meta.bestChain || 0, gs.stats?.maxChain || 0);
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

  gs.meta.runCount = Math.max(1, (gs.meta.runCount || 1) + 1);
  gs.meta.echoFragments = Math.max(0, (gs.meta.echoFragments || 0) + shardGain);

  if (GAME.Modules?.['SaveSystem']?.saveMeta) GAME.Modules['SaveSystem'].saveMeta();
  if (GAME.Modules?.['SaveSystem']?.clearSave) GAME.Modules['SaveSystem'].clearSave();

  return shardGain;
}
