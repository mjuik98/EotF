import {
  addPlayerCardAndRegisterState,
  addPlayerItemAndRegisterState,
  applyPlayerGoldDeltaState,
  applyPlayerHealDeltaState,
  applyPlayerMaxEnergyGrowthState,
  applyPlayerMaxHpGrowthState,
  replacePlayerDeckCardAndRegisterState,
} from '../../../shared/state/player_state_effects.js';

function resolveRewardRandomSource(options = {}, state = null) {
  return options.randomFn || options.randomSource || state;
}

function resolveRandomFn(source = null) {
  if (typeof source === 'function') return source;
  if (typeof source?.randomFn === 'function') return source.randomFn;
  if (typeof source?.random === 'function') return source.random;
  return Math.random;
}

function pickRandomItem(items, source = null) {
  if (!Array.isArray(items) || items.length < 1) return null;
  const randomFn = resolveRandomFn(source);
  const index = Math.min(items.length - 1, Math.floor(randomFn() * items.length));
  return items[index] ?? null;
}

export function applyMiniBossBonusState(state, data, options = {}) {
  if (!state?.player) return null;

  const heal = Math.max(1, Math.floor((state.player.maxHp || 1) * 0.15));
  const goldGain = Math.max(12, Math.floor(((state.currentRegion || 0) + 1) * 6));
  const healed = typeof state.heal === 'function'
    ? (state.heal(heal)?.healed ?? 0)
    : (applyPlayerHealDeltaState(state, heal)?.healed ?? 0);
  applyPlayerGoldDeltaState(state, goldGain);

  const rareItems = Object.values(data?.items || {}).filter((item) => {
    const isRareEnough = item?.rarity === 'rare' || item?.rarity === 'legendary';
    return isRareEnough && !(state.player.items || []).includes(item.id);
  });
  const guaranteed = pickRandomItem(rareItems, resolveRewardRandomSource(options, state));

  if (guaranteed) {
    addPlayerItemAndRegisterState(state, guaranteed.id, guaranteed);
  }

  return {
    goldGain,
    healed,
    guaranteed,
  };
}

export function applyBlessingRewardState(state, blessing) {
  if (!state?.player || !blessing) return false;

  if (blessing.type === 'hp') {
    applyPlayerMaxHpGrowthState(state, blessing.amount);
  }

  if (blessing.type === 'energy') {
    applyPlayerMaxEnergyGrowthState(state, blessing.amount);
  }

  return true;
}

export function addRewardCardToDeck(state, cardId) {
  return addPlayerCardAndRegisterState(state, cardId, { position: 'front' });
}

export function addRewardItemToInventory(state, itemId, itemDef) {
  return addPlayerItemAndRegisterState(state, itemId, itemDef);
}

export function upgradeRandomRewardCardState(state, data, options = {}) {
  const upgradable = (state?.player?.deck || []).filter((id) => data?.upgradeMap?.[id]);
  if (!upgradable.length) return null;

  const cardId = pickRandomItem(upgradable, resolveRewardRandomSource(options, state));
  if (!cardId) return null;
  const upgradedId = data.upgradeMap[cardId];
  return replacePlayerDeckCardAndRegisterState(state, cardId, upgradedId);
}
