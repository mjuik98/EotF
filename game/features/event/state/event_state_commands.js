import {
  registerCardDiscovered,
  registerItemFound,
} from '../../../shared/codex/codex_record_state_use_case.js';
import {
  applyLegacyPlayerGoldState,
  applyLegacyPlayerMaxEnergyGrowthState,
} from '../../../platform/legacy/state/legacy_player_state_command_fallback.js';
import {
  applyPlayerGoldState,
  applyPlayerMaxEnergyGrowthState,
} from '../../../shared/state/player_state_commands.js';

function removeFirstOccurrence(list, value) {
  if (!Array.isArray(list)) return false;
  const idx = list.indexOf(value);
  if (idx < 0) return false;
  list.splice(idx, 1);
  return true;
}

function applyEventPlayerGoldState(state, amount) {
  if (!state?.player) return null;
  const goldBefore = Number(state.player.gold || 0);
  const result = applyPlayerGoldState(state, amount);
  const goldAfterSharedCommand = Number(state.player.gold || 0);
  if (goldAfterSharedCommand !== goldBefore) {
    return {
      delta: goldAfterSharedCommand - goldBefore,
      goldAfter: goldAfterSharedCommand,
    };
  }
  if (result && typeof state.isDispatching === 'function') {
    return {
      delta: result.delta ?? (Number(amount) || 0),
      goldAfter: result.goldAfter ?? state.player.gold,
    };
  }
  return applyLegacyPlayerGoldState(state, amount, { forceLegacy: true });
}

function applyEventPlayerMaxEnergyGrowthState(state, amount, options = {}) {
  if (!state?.player) return null;
  const maxEnergyBefore = Number(state.player.maxEnergy || 0);
  const energyBefore = Number(state.player.energy || 0);
  const result = applyPlayerMaxEnergyGrowthState(state, amount, options);
  const maxEnergyAfterSharedCommand = Number(state.player.maxEnergy || 0);
  const energyAfterSharedCommand = Number(state.player.energy || 0);
  if (maxEnergyAfterSharedCommand !== maxEnergyBefore || energyAfterSharedCommand !== energyBefore) {
    return {
      maxEnergyAfter: maxEnergyAfterSharedCommand,
      energyAfter: energyAfterSharedCommand,
    };
  }
  if (result && typeof state.isDispatching === 'function') return result;
  return applyLegacyPlayerMaxEnergyGrowthState(state, amount, options, { forceLegacy: true });
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
  applyEventPlayerGoldState(state, -cost);
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
  applyEventPlayerGoldState(state, -cost);
  state.player.deck.push(cardId);
  registerCardDiscovered(state, cardId);
  return cardId;
}

export function applyShopCardUpgradeState(state, cardId, upgradedId, cost = 0) {
  if (!state?.player || !cardId || !upgradedId) return null;
  const idx = state.player.deck.indexOf(cardId);
  if (idx < 0) return null;
  state.player.deck[idx] = upgradedId;
  if (cost > 0) applyEventPlayerGoldState(state, -cost);
  registerCardDiscovered(state, upgradedId);
  return upgradedId;
}

export function applyShopPotionPurchaseState(state, cost, healAmount = 30) {
  if (!state?.player) return null;
  const goldResult = applyEventPlayerGoldState(state, -cost);
  state.heal?.(healAmount);
  return {
    gold: goldResult?.goldAfter ?? state.player.gold,
    healAmount,
  };
}

export function applyShopEnergyPurchaseState(state, cost, maxEnergyCap) {
  if (!state?.player) return null;
  const goldResult = applyEventPlayerGoldState(state, -cost);
  const energyResult = applyEventPlayerMaxEnergyGrowthState(state, 1, { maxEnergyCap });
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
