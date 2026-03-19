import {
  registerCardDiscovered,
  registerItemFound,
} from '../../../shared/codex/codex_record_state_use_case.js';

const RewardPlayerActionIds = Object.freeze({
  playerHeal: 'player:heal',
  playerGold: 'player:gold',
  playerMaxHpGrowth: 'player:max-hp-growth',
  playerMaxEnergyGrowth: 'player:max-energy-growth',
});

function dispatchRewardPlayerState(state, action, payload) {
  if (typeof state?.dispatch !== 'function') return null;
  const result = state.dispatch(action, payload);
  return result !== undefined && result !== null ? result : null;
}

function applyRewardPlayerHealState(state, amount) {
  if (!state?.player) return 0;
  const result = dispatchRewardPlayerState(state, RewardPlayerActionIds.playerHeal, { amount });
  if (result) return result.healed ?? 0;

  const hpBefore = state.player.hp || 0;
  state.player.hp = Math.min(state.player.maxHp || 1, hpBefore + amount);
  return Math.max(0, state.player.hp - hpBefore);
}

function applyRewardPlayerGoldState(state, amount) {
  if (!state?.player) return 0;
  const result = dispatchRewardPlayerState(state, RewardPlayerActionIds.playerGold, { amount });
  if (result) return result.delta ?? 0;

  state.player.gold = (state.player.gold || 0) + amount;
  return amount;
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
    const result = dispatchRewardPlayerState(state, RewardPlayerActionIds.playerMaxHpGrowth, { amount: blessing.amount });
    if (!result) {
      state.player.maxHp = (state.player.maxHp || 0) + blessing.amount;
      state.player.hp = Math.min(state.player.maxHp, (state.player.hp || 0) + blessing.amount);
    }
  }

  if (blessing.type === 'energy') {
    const result = dispatchRewardPlayerState(state, RewardPlayerActionIds.playerMaxEnergyGrowth, { amount: blessing.amount });
    if (!result) {
      state.player.maxEnergy = (state.player.maxEnergy || 0) + blessing.amount;
    }
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
