import {
  CLASS_MASTERY_LEVEL_XP,
  MAX_CLASS_MASTERY_LEVEL,
  getClassMasteryRoadmap,
} from '../../data/class_progression_data.js';
import { registerCardDiscovered } from './codex_records_system.js';

const DEFAULT_MAX_ENERGY_CAP = 5;

function toNonNegativeInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function toClassIds(classIds) {
  if (!Array.isArray(classIds)) return [];
  return classIds
    .map((id) => String(id || '').trim())
    .filter(Boolean);
}

function xpForLevel(level) {
  const lv = Math.max(1, Math.min(MAX_CLASS_MASTERY_LEVEL, Math.floor(Number(level) || 1)));
  const req = Number(CLASS_MASTERY_LEVEL_XP[lv]);
  if (Number.isFinite(req) && req >= 0) return Math.floor(req);
  return 0;
}

function calcLevel(totalXp) {
  const xp = toNonNegativeInt(totalXp, 0);
  for (let lv = MAX_CLASS_MASTERY_LEVEL; lv >= 1; lv -= 1) {
    if (xp >= xpForLevel(lv)) return lv;
  }
  return 1;
}

function calcProgress(level, totalXp) {
  const lv = Math.max(1, Math.min(MAX_CLASS_MASTERY_LEVEL, Math.floor(Number(level) || 1)));
  if (lv >= MAX_CLASS_MASTERY_LEVEL) return 1;
  const xp = toNonNegativeInt(totalXp, 0);
  const cur = xpForLevel(lv);
  const next = xpForLevel(lv + 1);
  const span = Math.max(1, next - cur);
  return Math.max(0, Math.min(1, (xp - cur) / span));
}

function ensureClassProgress(meta, classIds = []) {
  if (!meta || typeof meta !== 'object') return null;
  if (!meta.classProgress || typeof meta.classProgress !== 'object' || Array.isArray(meta.classProgress)) {
    meta.classProgress = {};
  }
  const cp = meta.classProgress;

  if (!cp.levels || typeof cp.levels !== 'object' || Array.isArray(cp.levels)) cp.levels = {};
  if (!cp.xp || typeof cp.xp !== 'object' || Array.isArray(cp.xp)) cp.xp = {};
  if (!Array.isArray(cp.pendingSummaries)) cp.pendingSummaries = [];

  const ids = toClassIds(classIds);
  ids.forEach((classId) => {
    const level = toNonNegativeInt(cp.levels[classId], 1);
    const normalizedLevel = Math.max(1, Math.min(MAX_CLASS_MASTERY_LEVEL, level || 1));
    cp.levels[classId] = normalizedLevel;

    const xp = toNonNegativeInt(cp.xp[classId], 0);
    cp.xp[classId] = Math.max(xp, xpForLevel(normalizedLevel));
  });

  return cp;
}

function buildRunRewards(gs, outcome, options = {}) {
  const rewards = [];
  const isVictory = outcome === 'victory';
  const abandoned = !!options.abandoned;

  const baseXp = abandoned ? 24 : (isVictory ? 120 : 60);
  rewards.push({
    label: abandoned ? '런 포기' : (isVictory ? '런 승리' : '런 패배'),
    xp: baseXp,
  });

  const floor = Math.max(0, toNonNegativeInt(options.floor, toNonNegativeInt(gs?.currentFloor, 0)));
  const floorBonus = Math.min(80, floor * 8);
  if (floorBonus > 0) rewards.push({ label: `층 보너스 (${floor}층)`, xp: floorBonus });

  const kills = Math.max(0, toNonNegativeInt(options.kills, toNonNegativeInt(gs?.player?.kills, 0)));
  const killBonus = Math.min(60, kills * 3);
  if (killBonus > 0) rewards.push({ label: `처치 보너스 (${kills})`, xp: killBonus });

  const miniBossCleared = !!(options.miniBossCleared || gs?.combat?.miniBossDefeated);
  if (miniBossCleared) rewards.push({ label: '미니 보스 처치', xp: 36 });

  const bossCleared = isVictory || !!options.bossCleared || !!gs?.combat?.bossDefeated;
  if (bossCleared) rewards.push({ label: '지역 보스 처치', xp: 80 });

  const ascension = toNonNegativeInt(
    options.ascension,
    toNonNegativeInt(gs?.meta?.runConfig?.ascension, 0),
  );
  if (ascension > 0) rewards.push({ label: `승천 보너스 (승천 ${ascension})`, xp: Math.min(80, ascension * 8) });

  const regionCount = Math.max(1, toNonNegativeInt(options.regionCount, 5));
  const cycle = Math.floor(Math.max(0, toNonNegativeInt(gs?.currentRegion, 0)) / regionCount);
  if (cycle > 0) rewards.push({ label: `사이클 보너스 (루프 ${cycle + 1})`, xp: Math.min(90, cycle * 18) });

  return rewards;
}

function resolveMasteryBonuses(classId, level) {
  const lv = Math.max(1, Math.min(MAX_CLASS_MASTERY_LEVEL, toNonNegativeInt(level, 1) || 1));
  const bonuses = {
    classId: String(classId || ''),
    level: lv,
    runStart: {
      maxHp: 0,
      gold: 0,
      maxEnergy: 0,
      starterAttackUpgrades: 0,
      starterRandomUpgrades: 0,
    },
    combatStart: {
      block: 0,
      extraOpeningDraw: 0,
      mageOpeningDiscount: 0,
      hunterFirstAttackMark: 0,
      swordsmanStartResonance: 0,
      paladinStartHeal: 0,
      berserkerFlatDamage: 0,
      guardianStartBlock: 0,
    },
    reward: {
      extraRelicChoices: 0,
    },
  };

  if (lv >= 2) bonuses.runStart.starterAttackUpgrades = 1;
  if (lv >= 3) bonuses.runStart.maxHp += 20;
  if (lv >= 4) bonuses.runStart.gold += 50;
  if (lv >= 5) bonuses.combatStart.block += 10;
  if (lv >= 6) bonuses.runStart.maxEnergy += 1;
  if (lv >= 7) bonuses.runStart.starterRandomUpgrades += 1;
  if (lv >= 8) bonuses.reward.extraRelicChoices += 1;
  if (lv >= 9) bonuses.combatStart.extraOpeningDraw += 1;

  if (lv >= 10) {
    if (classId === 'swordsman') bonuses.combatStart.swordsmanStartResonance = 3;
    else if (classId === 'mage') bonuses.combatStart.mageOpeningDiscount = 1;
    else if (classId === 'hunter') bonuses.combatStart.hunterFirstAttackMark = 2;
    else if (classId === 'paladin') bonuses.combatStart.paladinStartHeal = 6;
    else if (classId === 'berserker') bonuses.combatStart.berserkerFlatDamage = 2;
    else if (classId === 'guardian') bonuses.combatStart.guardianStartBlock = 10;
  }

  return bonuses;
}

function getEffectiveMaxEnergyCap(player, overrideCap) {
  const explicit = Number(overrideCap);
  if (Number.isFinite(explicit) && explicit >= 1) return Math.floor(explicit);

  const fromPlayer = Number(player?.maxEnergyCap);
  if (Number.isFinite(fromPlayer) && fromPlayer >= 1) return Math.floor(fromPlayer);

  return DEFAULT_MAX_ENERGY_CAP;
}

function pickRandomCandidate(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx] || null;
}

function applyStarterDeckUpgrades(gs, bonuses, data) {
  const player = gs?.player;
  if (!player || !Array.isArray(player.deck) || !data?.upgradeMap || !data?.cards) return [];

  const classId = String(player.class || '');
  const starterDeck = data?.startDecks?.[classId];
  if (!Array.isArray(starterDeck) || starterDeck.length === 0) return [];

  const starterSet = new Set(starterDeck);
  const usedIndexes = new Set();
  const upgradedIds = [];

  const upgradeOne = ({ attackOnly = false, fallbackAnyStarter = false } = {}) => {
    const collect = (onlyAttack) => player.deck
      .map((cardId, idx) => ({ cardId, idx }))
      .filter(({ cardId, idx }) => (
        !usedIndexes.has(idx)
        && starterSet.has(cardId)
        && data.upgradeMap[cardId]
        && (!onlyAttack || String(data.cards?.[cardId]?.type || '').toLowerCase() === 'attack')
      ));

    let candidates = collect(attackOnly);
    if (candidates.length === 0 && attackOnly && fallbackAnyStarter) {
      candidates = collect(false);
    }
    const chosen = pickRandomCandidate(candidates);
    if (!chosen) return null;

    const nextId = data.upgradeMap[chosen.cardId];
    if (!nextId) return null;

    player.deck[chosen.idx] = nextId;
    usedIndexes.add(chosen.idx);
    upgradedIds.push(nextId);
    return nextId;
  };

  const attackCount = toNonNegativeInt(bonuses?.runStart?.starterAttackUpgrades, 0);
  for (let i = 0; i < attackCount; i += 1) {
    upgradeOne({ attackOnly: true, fallbackAnyStarter: true });
  }

  const randomCount = toNonNegativeInt(bonuses?.runStart?.starterRandomUpgrades, 0);
  for (let i = 0; i < randomCount; i += 1) {
    upgradeOne({ attackOnly: false, fallbackAnyStarter: false });
  }

  return upgradedIds;
}

function applyRuntimeMasterySnapshot(gs, bonuses) {
  if (!gs?.player || !bonuses) return;
  const player = gs.player;
  const combat = bonuses.combatStart || {};
  const reward = bonuses.reward || {};

  player._classMasteryLevel = toNonNegativeInt(bonuses.level, 1) || 1;
  player._classMasteryRelicChoiceBonus = toNonNegativeInt(reward.extraRelicChoices, 0);
  player._classMasteryOpeningDrawBonus = toNonNegativeInt(combat.extraOpeningDraw, 0);
  player._classMasteryMageOpeningDiscount = toNonNegativeInt(combat.mageOpeningDiscount, 0);
  player._classMasteryHunterFirstAttackMark = toNonNegativeInt(combat.hunterFirstAttackMark, 0);
  player._classMasterySwordsmanResonance = toNonNegativeInt(combat.swordsmanStartResonance, 0);
  player._classMasteryPaladinStartHeal = toNonNegativeInt(combat.paladinStartHeal, 0);
  player._classMasteryBerserkerFlatDamage = toNonNegativeInt(combat.berserkerFlatDamage, 0);
  player._classMasteryGuardianStartBlock = toNonNegativeInt(combat.guardianStartBlock, 0);
  player._classMasteryBaseStartBlock = toNonNegativeInt(combat.block, 0);
}

function ensureTraitDiscountMap(player) {
  if (!player || typeof player !== 'object') return;
  if (!player._traitCardDiscounts || typeof player._traitCardDiscounts !== 'object') {
    player._traitCardDiscounts = {};
  }
}

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

    const cards = options.data?.cards || globalThis.DATA?.cards || {};
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
