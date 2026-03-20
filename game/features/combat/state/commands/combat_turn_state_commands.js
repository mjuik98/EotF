import {
  adjustPlayerSilenceGaugeState,
  adjustPlayerTimeRiftGaugeState,
  applyPlayerBuffState,
  applyPlayerShieldState,
  changePlayerEnergyState,
  setPlayerEchoState,
  setPlayerEnergyState,
} from '../../../../shared/state/player_state_commands.js';

function ensurePlayer(state) {
  return state?.player || null;
}

function ensureCombat(state) {
  return state?.combat || null;
}

export function setPlayerEnergyStateCommand(state, amount) {
  const result = setPlayerEnergyState(state, amount);
  if (result?.energyAfter !== undefined) return result.energyAfter;
  const player = ensurePlayer(state);
  if (!player) return 0;
  player.energy = Math.max(0, Number(amount) || 0);
  return player.energy;
}

export function reducePlayerEnergyStateCommand(state, amount) {
  const result = changePlayerEnergyState(state, -Math.max(0, amount));
  if (result?.energyAfter !== undefined) return result.energyAfter;
  const player = ensurePlayer(state);
  if (!player) return 0;
  player.energy = Math.max(0, Number(player.energy || 0) - Math.max(0, Number(amount) || 0));
  return player.energy;
}

export function setPlayerEchoStateCommand(state, amount) {
  const result = setPlayerEchoState(state, amount);
  if (result?.echoAfter !== undefined) return result.echoAfter;
  const player = ensurePlayer(state);
  if (!player) return 0;
  player.echo = Math.max(0, Math.min(Number(player.maxEcho || 0), Number(amount) || 0));
  return player.echo;
}

export function setPlayerEchoChainState(state, amount) {
  const player = ensurePlayer(state);
  if (!player) return 0;
  player.echoChain = Math.max(0, Number(amount) || 0);
  return player.echoChain;
}

export function setPlayerShieldStateCommand(state, amount) {
  const player = ensurePlayer(state);
  if (!player) return 0;
  const nextShield = Math.max(0, Number(amount) || 0);
  const delta = nextShield - Number(player.shield || 0);
  if (delta === 0) return nextShield;
  const result = applyPlayerShieldState(state, delta);
  if (result?.shieldAfter !== undefined) return result.shieldAfter;
  player.shield = nextShield;
  return player.shield;
}

export function setCombatPlayerTurnState(state, isPlayerTurn) {
  const combat = ensureCombat(state);
  if (!combat) return false;
  combat.playerTurn = Boolean(isPlayerTurn);
  return combat.playerTurn;
}

export function advanceCombatTurnState(state) {
  const combat = ensureCombat(state);
  if (!combat) return 0;
  combat.turn = Number(combat.turn || 0) + 1;
  return combat.turn;
}

export function addPlayerBuffStacksState(state, buffId, stacks, extra = {}) {
  const result = applyPlayerBuffState(state, buffId, stacks, extra);
  if (result) return result;
  const player = ensurePlayer(state);
  if (!player) return null;
  if (!player.buffs || typeof player.buffs !== 'object') player.buffs = {};
  const current = player.buffs[buffId];
  if (current) {
    current.stacks = (current.stacks || 0) + stacks;
    Object.assign(current, extra);
    return current;
  }
  player.buffs[buffId] = { stacks, ...extra };
  return player.buffs[buffId];
}

export function clampPlayerMaxEchoState(state, nextMax) {
  const player = ensurePlayer(state);
  if (!player) return 0;
  player.maxEcho = Math.max(50, Number(nextMax) || 0);
  setPlayerEchoStateCommand(state, player.echo);
  return player.maxEcho;
}

export function pushCardToExhaustedState(state, cardId) {
  const player = ensurePlayer(state);
  if (!player?.exhausted || !cardId) return null;
  player.exhausted.push(cardId);
  return cardId;
}

export function moveHandToGraveyardState(state) {
  const player = ensurePlayer(state);
  if (!player?.graveyard || !Array.isArray(player.hand)) return 0;
  player.graveyard.push(...player.hand);
  const moved = player.hand.length;
  player.hand = [];
  return moved;
}

export function resetTurnCardCostState(state) {
  const player = ensurePlayer(state);
  if (!player) return null;
  player.costDiscount = 0;
  player._nextCardDiscount = 0;
  player.zeroCost = false;
  player._freeCardUses = 0;
  return {
    costDiscount: player.costDiscount,
    nextCardDiscount: player._nextCardDiscount,
    zeroCost: player.zeroCost,
    freeCardUses: player._freeCardUses,
  };
}

export function reducePlayerSilenceGaugeStateCommand(state, amount) {
  const result = adjustPlayerSilenceGaugeState(state, -Math.max(0, Number(amount) || 0));
  if (result?.silenceGauge !== undefined) return result.silenceGauge;
  const player = ensurePlayer(state);
  if (!player) return 0;
  player.silenceGauge = Math.max(0, Number(player.silenceGauge || 0) - Math.max(0, Number(amount) || 0));
  return player.silenceGauge;
}

export function resetPlayerTimeRiftGaugeStateCommand(state) {
  const player = ensurePlayer(state);
  if (!player) return 0;
  const currentGauge = Math.max(0, Number(player.timeRiftGauge || 0));
  if (currentGauge === 0) return 0;
  const result = adjustPlayerTimeRiftGaugeState(state, -currentGauge);
  if (result?.timeRiftGauge !== undefined) return result.timeRiftGauge;
  player.timeRiftGauge = 0;
  return player.timeRiftGauge;
}

export function addEnemyShieldState(enemy, amount) {
  if (!enemy) return 0;
  enemy.shield = Number(enemy.shield || 0) + (Number(amount) || 0);
  return enemy.shield;
}

export function addEnemyAttackState(enemy, amount) {
  if (!enemy) return 0;
  enemy.atk = Number(enemy.atk || 0) + (Number(amount) || 0);
  return enemy.atk;
}

export function addEnemyStatusStacksState(enemy, statusId, amount) {
  if (!enemy || !statusId) return 0;
  enemy.statusEffects = enemy.statusEffects || {};
  enemy.statusEffects[statusId] = Number(enemy.statusEffects[statusId] || 0) + (Number(amount) || 0);
  return enemy.statusEffects[statusId];
}

export function setEnemyStatusState(enemy, statusId, value) {
  if (!enemy || !statusId) return undefined;
  enemy.statusEffects = enemy.statusEffects || {};
  enemy.statusEffects[statusId] = value;
  return enemy.statusEffects[statusId];
}

export function healEnemyState(enemy, amount) {
  if (!enemy) return 0;
  enemy.hp = Math.min(Number(enemy.maxHp || enemy.hp || 0), Number(enemy.hp || 0) + Math.max(0, Number(amount) || 0));
  return enemy.hp;
}

export function damageEnemyState(enemy, amount) {
  if (!enemy) return 0;
  enemy.hp = Math.max(0, Number(enemy.hp || 0) - Math.max(0, Number(amount) || 0));
  return enemy.hp;
}
