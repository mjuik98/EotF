import {
  registerCardDiscovered,
  registerItemFound,
} from '../../../shared/codex/codex_record_state_use_case.js';
import {
  applyPlayerGoldCompatState,
  applyPlayerHealCompatState,
  applyPlayerMaxEnergyGrowthCompatState,
  applyPlayerMaxHpGrowthCompatState,
} from '../../../shared/state/player_state_command_compat.js';

function applyRewardPlayerHealState(state, amount) {
  if (!state?.player) return 0;
  const hpBefore = Number(state.player.hp || 0);
  const result = applyPlayerHealCompatState(state, amount);
  const hpAfterSharedCommand = Number(state.player.hp || 0);
  if (hpAfterSharedCommand !== hpBefore) return Math.max(0, hpAfterSharedCommand - hpBefore);
  return result?.healed ?? 0;
}

function applyRewardPlayerGoldState(state, amount) {
  if (!state?.player) return 0;
  const goldBefore = Number(state.player.gold || 0);
  const result = applyPlayerGoldCompatState(state, amount);
  const goldAfterSharedCommand = Number(state.player.gold || 0);
  if (goldAfterSharedCommand !== goldBefore) return goldAfterSharedCommand - goldBefore;
  return result?.delta ?? 0;
}

export function applyMiniBossBonusState(state, data) {
  if (!state?.player) return null;

  const heal = Math.max(1, Math.floor((state.player.maxHp || 1) * 0.15));
  const goldGain = Math.max(12, Math.floor(((state.currentRegion || 0) + 1) * 6));
  const healed = applyRewardPlayerHealState(state, heal);
  applyRewardPlayerGoldState(state, goldGain);

  const rareItems = Object.values(data?.items || {}).filter((item) => {
    const isRareEnough = item?.rarity === 'rare' || item?.rarity === 'legendary';
    return isRareEnough && !(state.player.items || []).includes(item.id);
  });
  const guaranteed = rareItems.length
    ? rareItems[Math.floor(Math.random() * rareItems.length)]
    : null;

  if (guaranteed) {
    state.player.items.push(guaranteed.id);
    registerItemFound(state, guaranteed.id);
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
    applyPlayerMaxHpGrowthCompatState(state, blessing.amount);
  }

  if (blessing.type === 'energy') {
    applyPlayerMaxEnergyGrowthCompatState(state, blessing.amount);
  }

  return true;
}

export function addRewardCardToDeck(state, cardId) {
  if (!state?.player || !cardId) return null;
  state.player.deck.unshift(cardId);
  registerCardDiscovered(state, cardId);
  return cardId;
}

export function addRewardItemToInventory(state, itemId, itemDef) {
  if (!state?.player || !itemId) return null;
  state.player.items.push(itemId);
  registerItemFound(state, itemId);
  if (itemDef && typeof itemDef.onAcquire === 'function') itemDef.onAcquire(state);
  return itemId;
}

export function upgradeRandomRewardCardState(state, data) {
  const upgradable = (state?.player?.deck || []).filter((id) => data?.upgradeMap?.[id]);
  if (!upgradable.length) return null;

  const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
  const upgradedId = data.upgradeMap[cardId];
  const idx = state.player.deck.indexOf(cardId);
  if (idx < 0) return null;

  state.player.deck[idx] = upgradedId;
  registerCardDiscovered(state, upgradedId);
  return upgradedId;
}
