import {
  registerCardDiscovered,
  registerItemFound,
} from '../../../shared/codex/codex_record_state_use_case.js';

function removeFirstOccurrence(list, value) {
  if (!Array.isArray(list)) return false;
  const idx = list.indexOf(value);
  if (idx < 0) return false;
  list.splice(idx, 1);
  return true;
}

export function readItemShopStockCache(state, cacheKey) {
  if (!state || state._itemShopStockCacheKey !== cacheKey || !Array.isArray(state._itemShopStockCache)) {
    return null;
  }
  return state._itemShopStockCache;
}

export function writeItemShopStockCache(state, cacheKey, stock) {
  if (!state) return stock;
  state._itemShopStockCacheKey = cacheKey;
  state._itemShopStockCache = stock;
  return stock;
}

export function purchaseEventShopItemState(state, item, cost) {
  if (!state?.player || !item) return false;
  state.player.gold -= cost;
  state.player.items.push(item.id);
  registerItemFound(state, item.id);
  if (typeof item.onAcquire === 'function') item.onAcquire(state);
  return true;
}

export function discardEventCardState(state, cardId) {
  if (!state?.player || !cardId) return false;
  return removeFirstOccurrence(state.player.deck, cardId)
    || removeFirstOccurrence(state.player.hand, cardId)
    || removeFirstOccurrence(state.player.graveyard, cardId);
}

export function applyShopCardPurchaseState(state, cardId, cost) {
  if (!state?.player || !cardId) return null;
  state.player.gold -= cost;
  state.player.deck.push(cardId);
  registerCardDiscovered(state, cardId);
  return cardId;
}

export function applyShopCardUpgradeState(state, cardId, upgradedId, cost = 0) {
  if (!state?.player || !cardId || !upgradedId) return null;
  const idx = state.player.deck.indexOf(cardId);
  if (idx < 0) return null;
  state.player.deck[idx] = upgradedId;
  if (cost > 0) state.player.gold -= cost;
  registerCardDiscovered(state, upgradedId);
  return upgradedId;
}

export function applyShopPotionPurchaseState(state, cost, healAmount = 30) {
  if (!state?.player) return null;
  state.player.gold -= cost;
  state.heal?.(healAmount);
  return {
    gold: state.player.gold,
    healAmount,
  };
}

export function applyShopEnergyPurchaseState(state, cost, maxEnergyCap) {
  if (!state?.player) return null;
  state.player.gold -= cost;
  state.player.maxEnergy = Math.min(maxEnergyCap, (state.player.maxEnergy || 0) + 1);
  state.player.energy = Math.min(state.player.maxEnergy, (state.player.energy || 0) + 1);
  return {
    gold: state.player.gold,
    maxEnergy: state.player.maxEnergy,
    energy: state.player.energy,
  };
}

export function restoreStagnationDeckState(state) {
  if (!Array.isArray(state?._stagnationVault) || state._stagnationVault.length === 0) return [];
  const restored = [...state._stagnationVault];
  state._stagnationVault = [];
  state.player.deck.push(...restored);
  restored.forEach((cardId) => registerCardDiscovered(state, cardId));
  return restored;
}

export function applyRestCardUpgradeState(state, cardId, upgradedId) {
  if (!state?.player || !cardId || !upgradedId) return null;
  const idx = state.player.deck.indexOf(cardId);
  if (idx < 0) return null;
  state.player.deck[idx] = upgradedId;
  registerCardDiscovered(state, upgradedId);
  return upgradedId;
}
