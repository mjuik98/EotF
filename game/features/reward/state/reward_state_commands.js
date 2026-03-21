import {
  addPlayerCardAndRegisterState,
  addPlayerItemAndRegisterState,
  applyPlayerGoldDeltaState,
  applyPlayerHealDeltaState,
  applyPlayerMaxEnergyGrowthState,
  applyPlayerMaxHpGrowthState,
  replacePlayerDeckCardAndRegisterState,
} from '../../../shared/state/player_state_effects.js';

export function applyMiniBossBonusState(state, data) {
  if (!state?.player) return null;

  const heal = Math.max(1, Math.floor((state.player.maxHp || 1) * 0.15));
  const goldGain = Math.max(12, Math.floor(((state.currentRegion || 0) + 1) * 6));
  const healed = applyPlayerHealDeltaState(state, heal)?.healed ?? 0;
  applyPlayerGoldDeltaState(state, goldGain);

  const rareItems = Object.values(data?.items || {}).filter((item) => {
    const isRareEnough = item?.rarity === 'rare' || item?.rarity === 'legendary';
    return isRareEnough && !(state.player.items || []).includes(item.id);
  });
  const guaranteed = rareItems.length
    ? rareItems[Math.floor(Math.random() * rareItems.length)]
    : null;

  if (guaranteed) {
    addPlayerItemAndRegisterState(state, guaranteed.id);
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

export function upgradeRandomRewardCardState(state, data) {
  const upgradable = (state?.player?.deck || []).filter((id) => data?.upgradeMap?.[id]);
  if (!upgradable.length) return null;

  const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
  const upgradedId = data.upgradeMap[cardId];
  return replacePlayerDeckCardAndRegisterState(state, cardId, upgradedId);
}
