import { toNonNegativeInt } from './xp_policy.js';

const DEFAULT_MAX_ENERGY_CAP = 5;

export function resolveMasteryBonuses(classId, level) {
  const lv = Math.max(1, toNonNegativeInt(level, 1) || 1);
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

export function getEffectiveMaxEnergyCap(player, overrideCap) {
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

export function applyStarterDeckUpgrades(gs, bonuses, data) {
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

export function applyRuntimeMasterySnapshot(gs, bonuses) {
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

export function ensureTraitDiscountMap(player) {
  if (!player || typeof player !== 'object') return;
  if (!player._traitCardDiscounts || typeof player._traitCardDiscounts !== 'object') {
    player._traitCardDiscounts = {};
  }
}
