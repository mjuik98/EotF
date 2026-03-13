import {
  getClassMasteryRoadmap,
  MAX_CLASS_MASTERY_LEVEL,
} from '../../../shared/progression/class_progression_data_use_case.js';
import { registerCardDiscovered } from '../../../shared/codex/codex_record_state_use_case.js';
import { ensureClassProgress } from './class_progression/meta_persistence.js';
import { buildRunRewards } from './class_progression/reward_calculator.js';
import {
  applyRuntimeMasterySnapshot,
  applyStarterDeckUpgrades,
  ensureTraitDiscountMap,
  getEffectiveMaxEnergyCap,
  resolveMasteryBonuses,
} from './class_progression/runtime_apply.js';
import {
  calcLevel,
  calcProgress,
  toClassIds,
  toNonNegativeInt,
  xpForLevel,
} from './class_progression/xp_policy.js';

export const ClassProgressionSystem = {
  MAX_LEVEL: MAX_CLASS_MASTERY_LEVEL,

  ensureMeta(meta, classIds = []) {
    ensureClassProgress(meta, classIds);
  },

  getClassState(meta, classId, classIds = []) {
    if (!meta || !classId) return null;
    const cp = ensureClassProgress(meta, classIds);
    if (!cp) return null;

    const rawXp = toNonNegativeInt(cp.xp[classId], 0);
    const level = calcLevel(rawXp);
    cp.levels[classId] = level;
    cp.xp[classId] = rawXp;

    return {
      classId,
      level,
      totalXp: rawXp,
      currentLevelXp: xpForLevel(level),
      nextLevelXp: level >= MAX_CLASS_MASTERY_LEVEL ? null : xpForLevel(level + 1),
      progress: calcProgress(level, rawXp),
    };
  },

  getActiveBonuses(meta, classId, classIds = []) {
    const state = this.getClassState(meta, classId, classIds);
    if (!state) return null;
    return resolveMasteryBonuses(classId, state.level);
  },

  refreshRuntimeBonuses(gs, options = {}) {
    if (!gs?.meta || !gs?.player?.class) return null;
    const classIds = toClassIds(options.classIds || []);
    const classId = String(gs.player.class);
    const bonuses = this.getActiveBonuses(gs.meta, classId, classIds);
    if (!bonuses) return null;
    applyRuntimeMasterySnapshot(gs, bonuses);
    return bonuses;
  },

  applyRunStartBonuses(gs, options = {}) {
    if (!gs?.meta || !gs?.player?.class) return null;
    const player = gs.player;
    const classIds = toClassIds(options.classIds || []);
    const bonuses = this.refreshRuntimeBonuses(gs, { classIds });
    if (!bonuses) return null;

    const classId = String(player.class);
    if (gs._classMasteryRunStartApplied && gs._classMasteryAppliedClassId === classId) {
      return bonuses;
    }

    const hpBonus = toNonNegativeInt(bonuses.runStart.maxHp, 0);
    if (hpBonus > 0) {
      player.maxHp = Math.max(1, toNonNegativeInt(player.maxHp, 1) + hpBonus);
      player.hp = Math.min(player.maxHp, toNonNegativeInt(player.hp, player.maxHp) + hpBonus);
    }

    const goldBonus = toNonNegativeInt(bonuses.runStart.gold, 0);
    if (goldBonus > 0) {
      player.gold = toNonNegativeInt(player.gold, 0) + goldBonus;
    }

    const maxEnergyBonus = toNonNegativeInt(bonuses.runStart.maxEnergy, 0);
    if (maxEnergyBonus > 0) {
      const cap = getEffectiveMaxEnergyCap(player, options.maxEnergyCap);
      const beforeMax = Math.max(1, toNonNegativeInt(player.maxEnergy, 1));
      const nextMax = Math.min(cap, beforeMax + maxEnergyBonus);
      const actualIncrease = Math.max(0, nextMax - beforeMax);
      player.maxEnergy = nextMax;
      player.energy = Math.min(nextMax, toNonNegativeInt(player.energy, 0) + actualIncrease);
    }

    const upgradedIds = applyStarterDeckUpgrades(gs, bonuses, options.data);
    if (upgradedIds.length > 0) {
      upgradedIds.forEach((cardId) => registerCardDiscovered(gs, cardId));
    }

    gs._classMasteryRunStartApplied = true;
    gs._classMasteryAppliedClassId = classId;
    return bonuses;
  },

  applyCombatStartBonuses(gs, options = {}) {
    if (!gs?.player?.class) return null;
    const classIds = toClassIds(options.classIds || []);
    const bonuses = this.refreshRuntimeBonuses(gs, { classIds });
    if (!bonuses) return null;

    const player = gs.player;
    const combat = bonuses.combatStart || {};
    player._classMasteryFlatDamageBonus = toNonNegativeInt(combat.berserkerFlatDamage, 0);
    player._classMasteryHunterMarkPending = toNonNegativeInt(combat.hunterFirstAttackMark, 0);
    player._classMasteryMageOpeningDiscountPending = toNonNegativeInt(combat.mageOpeningDiscount, 0);

    const startBlock = toNonNegativeInt(combat.block, 0) + toNonNegativeInt(combat.guardianStartBlock, 0);
    if (startBlock > 0) {
      if (typeof gs.addShield === 'function') gs.addShield(startBlock, { name: 'Class Mastery', type: 'trait' });
      else player.shield = Math.max(0, toNonNegativeInt(player.shield, 0) + startBlock);
    }

    const startResonance = toNonNegativeInt(combat.swordsmanStartResonance, 0);
    if (startResonance > 0) {
      if (typeof gs.getBuff === 'function' && gs.getBuff('resonance')) {
        const current = gs.getBuff('resonance');
        current.dmgBonus = toNonNegativeInt(current.dmgBonus, 0) + startResonance;
        current.stacks = Math.max(99, toNonNegativeInt(current.stacks, 99));
      } else if (typeof gs.addBuff === 'function') {
        gs.addBuff('resonance', 99, { dmgBonus: startResonance });
      } else {
        if (!player.buffs || typeof player.buffs !== 'object') player.buffs = {};
        player.buffs.resonance = { stacks: 99, dmgBonus: startResonance };
      }
    }

    const startHeal = toNonNegativeInt(combat.paladinStartHeal, 0);
    if (startHeal > 0) {
      if (typeof gs.heal === 'function') gs.heal(startHeal, { name: 'Class Mastery', type: 'trait' });
      else player.hp = Math.min(toNonNegativeInt(player.maxHp, 1), toNonNegativeInt(player.hp, 0) + startHeal);
    }

    return bonuses;
  },

  applyDeckReadyBonuses(gs, options = {}) {
    if (!gs?.player) return null;
    const player = gs.player;
    const classIds = toClassIds(options.classIds || []);
    const bonuses = this.refreshRuntimeBonuses(gs, { classIds });
    if (!bonuses) return null;

    const pendingDiscounts = toNonNegativeInt(player._classMasteryMageOpeningDiscountPending, 0);
    if (pendingDiscounts <= 0) return bonuses;

    const cards = options.cards || options.data?.cards || {};
    const hand = Array.isArray(player.hand) ? player.hand : [];
    const candidates = hand.filter((cardId) => Number(cards?.[cardId]?.cost || 0) > 0);
    if (candidates.length === 0) {
      player._classMasteryMageOpeningDiscountPending = 0;
      return bonuses;
    }

    ensureTraitDiscountMap(player);
    const picked = new Set();
    for (let i = 0; i < pendingDiscounts; i += 1) {
      const remaining = candidates.filter((cardId, idx) => !picked.has(idx));
      if (remaining.length === 0) break;
      const cardId = remaining[Math.floor(Math.random() * remaining.length)];
      player._traitCardDiscounts[cardId] = toNonNegativeInt(player._traitCardDiscounts[cardId], 0) + 1;
      const pickedIndex = candidates.findIndex((id, idx) => id === cardId && !picked.has(idx));
      if (pickedIndex >= 0) picked.add(pickedIndex);
      if (typeof gs.addLog === 'function') {
        const name = cards?.[cardId]?.name || cardId;
        gs.addLog(`[Class Mastery] ${name} cost -1 this combat.`, 'echo');
      }
    }

    player._classMasteryMageOpeningDiscountPending = 0;
    return bonuses;
  },

  getRewardRelicChoiceBonus(gs, options = {}) {
    const direct = toNonNegativeInt(gs?.player?._classMasteryRelicChoiceBonus, 0);
    if (direct > 0) return direct;

    if (!gs?.meta || !gs?.player?.class) return 0;
    const classIds = toClassIds(options.classIds || []);
    const bonuses = this.getActiveBonuses(gs.meta, String(gs.player.class), classIds);
    return toNonNegativeInt(bonuses?.reward?.extraRelicChoices, 0);
  },

  getRoadmap(classId) {
    return getClassMasteryRoadmap(classId);
  },

  awardRunXP(gs, outcome = 'defeat', options = {}) {
    if (!gs?.meta || !gs?.player?.class) return null;

    const classIds = toClassIds(options.classIds || []);
    const cp = ensureClassProgress(gs.meta, classIds);
    if (!cp) return null;

    const classId = String(gs.player.class);
    const before = this.getClassState(gs.meta, classId, classIds) || {
      classId,
      level: 1,
      totalXp: 0,
      currentLevelXp: 0,
      nextLevelXp: xpForLevel(2),
      progress: 0,
    };

    const rewards = buildRunRewards(gs, outcome, options);
    const totalGain = rewards.reduce((sum, row) => sum + toNonNegativeInt(row?.xp, 0), 0);
    const afterTotalXp = toNonNegativeInt(before.totalXp, 0) + totalGain;
    cp.xp[classId] = afterTotalXp;

    const after = this.getClassState(gs.meta, classId, classIds);
    if (!after) return null;

    const levelUps = [];
    for (let lv = before.level + 1; lv <= after.level; lv += 1) {
      levelUps.push(lv);
    }

    const summary = {
      outcome: outcome === 'victory' ? 'victory' : 'defeat',
      classId,
      rewards,
      totalGain,
      before,
      after,
      levelUps,
      ts: Date.now(),
    };

    cp.pendingSummaries.push(summary);
    return summary;
  },

  peekPendingSummary(meta, classIds = []) {
    const cp = ensureClassProgress(meta, classIds);
    if (!cp || cp.pendingSummaries.length === 0) return null;
    return cp.pendingSummaries[0] || null;
  },

  consumePendingSummary(meta, classIds = []) {
    const cp = ensureClassProgress(meta, classIds);
    if (!cp || cp.pendingSummaries.length === 0) return null;
    return cp.pendingSummaries.shift() || null;
  },
};
