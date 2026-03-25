import { registerCardDiscovered, registerItemFound } from '../codex/codex_record_state_use_case.js';
import { SetBonusSystem } from '../progression/set_bonus_system.js';
import {
  applyPlayerGoldCompatState,
  applyPlayerHealCompatState,
  applyPlayerMaxEnergyGrowthCompatState,
  applyPlayerMaxHpGrowthCompatState,
} from './player_state_command_compat.js';

export function applyPlayerGoldDeltaState(state, amount) {
  if (!state?.player) return null;

  const goldBefore = Number(state.player.gold || 0);
  const result = applyPlayerGoldCompatState(state, amount);
  const goldAfter = Number(state.player.gold || 0);
  if (goldAfter !== goldBefore) {
    return {
      delta: goldAfter - goldBefore,
      goldAfter,
    };
  }
  if (result) {
    return {
      delta: result.delta ?? (Number(amount) || 0),
      goldAfter: result.goldAfter ?? state.player.gold,
    };
  }
  return null;
}

export function applyPlayerHealDeltaState(state, amount) {
  if (!state?.player) return null;

  const hpBefore = Number(state.player.hp || 0);
  const result = applyPlayerHealCompatState(state, amount);
  const hpAfter = Number(state.player.hp || 0);
  if (hpAfter !== hpBefore) {
    return {
      healed: Math.max(0, hpAfter - hpBefore),
      hpAfter,
    };
  }
  return result ?? null;
}

export function applyPlayerMaxEnergyGrowthState(state, amount, options = {}) {
  if (!state?.player) return null;

  const maxEnergyBefore = Number(state.player.maxEnergy || 0);
  const energyBefore = Number(state.player.energy || 0);
  const result = applyPlayerMaxEnergyGrowthCompatState(state, amount, options);
  const maxEnergyAfter = Number(state.player.maxEnergy || 0);
  const energyAfter = Number(state.player.energy || 0);
  if (maxEnergyAfter !== maxEnergyBefore || energyAfter !== energyBefore) {
    return {
      maxEnergyAfter,
      energyAfter,
    };
  }
  return result ?? null;
}

export function applyPlayerMaxHpGrowthState(state, amount) {
  return applyPlayerMaxHpGrowthCompatState(state, amount);
}

export function addPlayerItemAndRegisterState(state, itemId, itemDef = null) {
  if (!state?.player || !itemId) return null;
  state.player.items.push(itemId);
  registerItemFound(state, itemId);
  if (itemDef && typeof itemDef.onAcquire === 'function') itemDef.onAcquire(state);
  SetBonusSystem.applyPassiveBonuses(state);
  return itemId;
}

export function addPlayerCardAndRegisterState(state, cardId, options = {}) {
  if (!state?.player || !cardId) return null;
  const deck = state.player.deck || (state.player.deck = []);
  if (options.position === 'front') deck.unshift(cardId);
  else deck.push(cardId);
  registerCardDiscovered(state, cardId);
  return cardId;
}

export function replacePlayerDeckCardAndRegisterState(state, cardId, upgradedId) {
  if (!state?.player || !cardId || !upgradedId) return null;
  const idx = state.player.deck.indexOf(cardId);
  if (idx < 0) return null;
  state.player.deck[idx] = upgradedId;
  registerCardDiscovered(state, upgradedId);
  return upgradedId;
}

export function registerPlayerDeckCardsState(state, cardIds) {
  if (!state || !Array.isArray(cardIds)) return [];
  cardIds.forEach((cardId) => registerCardDiscovered(state, cardId));
  return cardIds;
}
