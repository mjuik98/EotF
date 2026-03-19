import { CombatStateActionIds } from './combat_state_action_ids.js';

function collectPermanentBuffs(player, permanentBuffIds = ['echo_berserk']) {
  const permanentBuffs = {};
  if (!player?.buffs) return permanentBuffs;

  Object.keys(player.buffs).forEach((buffId) => {
    if (permanentBuffIds.includes(buffId)) {
      permanentBuffs[buffId] = player.buffs[buffId];
    }
  });
  return permanentBuffs;
}

function dispatchCombatSetupState(state, action, payload = {}) {
  if (typeof state?.dispatch !== 'function') return null;
  const result = state.dispatch(action, payload);
  return result !== undefined && result !== null ? result : null;
}

export function applyCombatSetupResetReducerState(state) {
  const combat = state?.combat;
  const player = state?.player;
  if (!combat || !player) return null;

  combat.enemies = [];
  combat.turn = 1;
  combat.playerTurn = true;
  combat.log = [];

  player.shield = 0;
  player.echoChain = 0;
  player.energy = player.maxEnergy;
  player.buffs = collectPermanentBuffs(player);
  player.zeroCost = false;
  player.costDiscount = 0;
  player._nextCardDiscount = 0;
  player._freeCardUses = 0;
  player._cascadeCards = new Map();
  player._traitCardDiscounts = {};
  player._mageCastCounter = 0;
  player._mageLastDiscountTarget = null;

  combat.bossDefeated = false;
  combat.miniBossDefeated = false;
  state._endCombatScheduled = false;
  state._endCombatRunning = false;
  state._selectedTarget = null;
  state._combatStartDmg = state.stats?.damageDealt;
  state._combatStartTaken = state.stats?.damageTaken;
  state._combatStartKills = state.player?.kills;

  return {
    selectedTarget: state._selectedTarget,
    turn: combat.turn,
  };
}

export function resetCombatSetupState(state) {
  return dispatchCombatSetupState(state, CombatStateActionIds.combatSetupReset, {})
    ?? applyCombatSetupResetReducerState(state);
}

export function applyCombatEnemyAddReducerState(state, enemy) {
  if (!state?.combat || !enemy) return null;
  state.combat.enemies.push(enemy);
  return enemy;
}

export function addCombatEnemyState(state, enemy) {
  return dispatchCombatSetupState(state, CombatStateActionIds.combatEnemyAdd, { enemy })
    ?? applyCombatEnemyAddReducerState(state, enemy);
}

export function applyCombatDeckPrepareReducerState(state) {
  const player = state?.player;
  if (!player) return null;

  player.drawPile = [...(player.deck || [])];
  player.discardPile = [];
  player.hand = [];
  return {
    drawPile: player.drawPile,
    discardPile: player.discardPile,
    hand: player.hand,
  };
}

export function prepareCombatDeckState(state) {
  return dispatchCombatSetupState(state, CombatStateActionIds.combatDeckPrepare, {})
    ?? applyCombatDeckPrepareReducerState(state);
}

export function applyCombatSelectedTargetSyncReducerState(state) {
  const firstAlive = state?.combat?.enemies?.findIndex((enemy) => enemy.hp > 0) ?? -1;
  state._selectedTarget = firstAlive >= 0 ? firstAlive : null;
  return state._selectedTarget;
}

export function syncCombatSelectedTargetState(state) {
  return dispatchCombatSetupState(state, CombatStateActionIds.combatSelectedTargetSync, {})
    ?? applyCombatSelectedTargetSyncReducerState(state);
}
