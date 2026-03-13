import { registerCardDiscovered } from '../../../../shared/codex/codex_record_state_use_case.js';
import {
  applyPlayerGoldState,
  applyPlayerHealState,
  applyPlayerMaxEnergyGrowthState,
  applyPlayerMaxHpGrowthState,
} from '../../../../shared/state/player_state_commands.js';
import {
  applyRuntimeMasterySnapshot,
  applyStarterDeckUpgrades,
  ensureTraitDiscountMap,
  getEffectiveMaxEnergyCap,
} from './runtime_apply.js';
import { toClassIds, toNonNegativeInt } from './xp_policy.js';
import { getClassActiveBonuses } from './class_progression_queries.js';

export function refreshRuntimeBonuses(gs, options = {}) {
  if (!gs?.meta || !gs?.player?.class) return null;
  const classIds = toClassIds(options.classIds || []);
  const classId = String(gs.player.class);
  const bonuses = getClassActiveBonuses(gs.meta, classId, classIds);
  if (!bonuses) return null;
  applyRuntimeMasterySnapshot(gs, bonuses);
  return bonuses;
}

export function applyRunStartBonuses(gs, options = {}) {
  if (!gs?.meta || !gs?.player?.class) return null;
  const player = gs.player;
  const classIds = toClassIds(options.classIds || []);
  const bonuses = refreshRuntimeBonuses(gs, { classIds });
  if (!bonuses) return null;

  const classId = String(player.class);
  if (gs._classMasteryRunStartApplied && gs._classMasteryAppliedClassId === classId) {
    return bonuses;
  }

  const hpBonus = toNonNegativeInt(bonuses.runStart.maxHp, 0);
  if (hpBonus > 0) {
    applyPlayerMaxHpGrowthState(gs, hpBonus);
  }

  const goldBonus = toNonNegativeInt(bonuses.runStart.gold, 0);
  if (goldBonus > 0) {
    applyPlayerGoldState(gs, goldBonus);
  }

  const maxEnergyBonus = toNonNegativeInt(bonuses.runStart.maxEnergy, 0);
  if (maxEnergyBonus > 0) {
    applyPlayerMaxEnergyGrowthState(gs, maxEnergyBonus, {
      maxEnergyCap: getEffectiveMaxEnergyCap(player, options.maxEnergyCap),
    });
  }

  const upgradedIds = applyStarterDeckUpgrades(gs, bonuses, options.data);
  if (upgradedIds.length > 0) {
    upgradedIds.forEach((cardId) => registerCardDiscovered(gs, cardId));
  }

  gs._classMasteryRunStartApplied = true;
  gs._classMasteryAppliedClassId = classId;
  return bonuses;
}

export function applyCombatStartBonuses(gs, options = {}) {
  if (!gs?.player?.class) return null;
  const classIds = toClassIds(options.classIds || []);
  const bonuses = refreshRuntimeBonuses(gs, { classIds });
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
    else applyPlayerHealState(gs, startHeal);
  }

  return bonuses;
}

export function applyDeckReadyBonuses(gs, options = {}) {
  if (!gs?.player) return null;
  const player = gs.player;
  const classIds = toClassIds(options.classIds || []);
  const bonuses = refreshRuntimeBonuses(gs, { classIds });
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
}
