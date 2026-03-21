import {
  addPlayerCardAndRegisterState,
  addPlayerItemAndRegisterState,
  applyPlayerGoldDeltaState,
  applyPlayerMaxEnergyGrowthState,
  registerPlayerDeckCardsState,
  replacePlayerDeckCardAndRegisterState,
} from '../../../shared/state/player_state_effects.js';

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
  applyPlayerGoldDeltaState(state, -cost);
  addPlayerItemAndRegisterState(state, item.id, item);
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
  applyPlayerGoldDeltaState(state, -cost);
  return addPlayerCardAndRegisterState(state, cardId);
}

export function applyShopCardUpgradeState(state, cardId, upgradedId, cost = 0) {
  if (!state?.player || !cardId || !upgradedId) return null;
  if (cost > 0) applyPlayerGoldDeltaState(state, -cost);
  return replacePlayerDeckCardAndRegisterState(state, cardId, upgradedId);
}

export function applyShopPotionPurchaseState(state, cost, healAmount = 30) {
  if (!state?.player) return null;
  const goldResult = applyPlayerGoldDeltaState(state, -cost);
  state.heal?.(healAmount);
  return {
    gold: goldResult?.goldAfter ?? state.player.gold,
    healAmount,
  };
}

export function applyShopEnergyPurchaseState(state, cost, maxEnergyCap) {
  if (!state?.player) return null;
  const goldResult = applyPlayerGoldDeltaState(state, -cost);
  const energyResult = applyPlayerMaxEnergyGrowthState(state, 1, { maxEnergyCap });
  return {
    gold: goldResult?.goldAfter ?? state.player.gold,
    maxEnergy: energyResult?.maxEnergyAfter ?? state.player.maxEnergy,
    energy: energyResult?.energyAfter ?? state.player.energy,
  };
}

export function restoreStagnationDeckState(state) {
  if (!Array.isArray(state?._stagnationVault) || state._stagnationVault.length === 0) return [];
  const restored = [...state._stagnationVault];
  state._stagnationVault = [];
  state.player.deck.push(...restored);
  registerPlayerDeckCardsState(state, restored);
  return restored;
}

export function applyRestCardUpgradeState(state, cardId, upgradedId) {
  return replacePlayerDeckCardAndRegisterState(state, cardId, upgradedId);
}
