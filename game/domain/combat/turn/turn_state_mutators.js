import {
  adjustPlayerSilenceGaugeState,
  adjustPlayerTimeRiftGaugeState,
  applyPlayerBuffState,
  applyPlayerShieldState,
  changePlayerEnergyState,
  setPlayerEchoState,
  setPlayerEnergyState,
} from '../../../shared/state/player_state_commands.js';

export function decrementStackedBuff(buffBag, buffId) {
  const buff = buffBag?.[buffId];
  if (!buff || !Number.isFinite(buff.stacks)) return false;
  buff.stacks--;
  if (buff.stacks <= 0) {
    delete buffBag[buffId];
  }
  return true;
}

export function setPlayerEnergy(gs, amount) {
  const result = setPlayerEnergyState(gs, amount);
  if (result && result.energyAfter !== undefined) return result.energyAfter;
  gs.player.energy = Math.max(0, amount);
  return gs.player.energy;
}

export function reducePlayerEnergy(gs, amount) {
  const result = changePlayerEnergyState(gs, -Math.max(0, amount));
  if (result && result.energyAfter !== undefined) return result.energyAfter;
  return setPlayerEnergy(gs, Math.max(0, gs.player.energy - amount));
}

export function setPlayerEcho(gs, amount) {
  const result = setPlayerEchoState(gs, amount);
  if (result && result.echoAfter !== undefined) return result.echoAfter;
  gs.player.echo = Math.max(0, Math.min(gs.player.maxEcho, amount));
  return gs.player.echo;
}

export function setPlayerEchoChain(gs, amount) {
  gs.player.echoChain = Math.max(0, amount);
  return gs.player.echoChain;
}

export function setPlayerShield(gs, amount) {
  const nextShield = Math.max(0, amount);
  const delta = nextShield - Number(gs.player.shield || 0);
  if (delta === 0) return nextShield;
  const result = applyPlayerShieldState(gs, delta);
  if (result && result.shieldAfter !== undefined) return result.shieldAfter;
  gs.player.shield = nextShield;
  return gs.player.shield;
}

export function reducePlayerSilenceGauge(gs, amount) {
  const result = adjustPlayerSilenceGaugeState(gs, -Math.max(0, amount));
  if (result && result.silenceGauge !== undefined) return result.silenceGauge;
  gs.player.silenceGauge = Math.max(0, (gs.player.silenceGauge || 0) - amount);
  return gs.player.silenceGauge;
}

export function resetPlayerTimeRiftGauge(gs) {
  const currentGauge = Math.max(0, Number(gs.player.timeRiftGauge || 0));
  if (currentGauge === 0) return 0;
  const result = adjustPlayerTimeRiftGaugeState(gs, -currentGauge);
  if (result && result.timeRiftGauge !== undefined) return result.timeRiftGauge;
  gs.player.timeRiftGauge = 0;
  return gs.player.timeRiftGauge;
}

export function moveHandToGraveyard(gs) {
  gs.player.graveyard.push(...gs.player.hand);
  gs.player.hand = [];
}

export function resetTurnCardCostState(gs) {
  gs.player.costDiscount = 0;
  gs.player._nextCardDiscount = 0;
  gs.player.zeroCost = false;
  gs.player._freeCardUses = 0;
}

export function setCombatPlayerTurn(gs, isPlayerTurn) {
  gs.combat.playerTurn = isPlayerTurn;
  return gs.combat.playerTurn;
}

export function advanceCombatTurn(gs) {
  gs.combat.turn++;
  return gs.combat.turn;
}

export function addPlayerBuffStacks(gs, buffId, stacks, extra = {}) {
  const result = applyPlayerBuffState(gs, buffId, stacks, extra);
  if (result) return result;
  const current = gs.player.buffs[buffId];
  if (current) {
    current.stacks = (current.stacks || 0) + stacks;
    Object.assign(current, extra);
    return current;
  }
  gs.player.buffs[buffId] = { stacks, ...extra };
  return gs.player.buffs[buffId];
}

export function clampPlayerMaxEcho(gs, nextMax) {
  gs.player.maxEcho = Math.max(50, nextMax);
  setPlayerEcho(gs, gs.player.echo);
  return gs.player.maxEcho;
}

export function pushCardToExhausted(gs, cardId) {
  gs.player.exhausted.push(cardId);
}

export function addEnemyShield(enemy, amount) {
  enemy.shield = (enemy.shield || 0) + amount;
  return enemy.shield;
}

export function addEnemyAttack(enemy, amount) {
  enemy.atk += amount;
  return enemy.atk;
}

export function addEnemyStatusStacks(enemy, statusId, amount) {
  enemy.statusEffects = enemy.statusEffects || {};
  enemy.statusEffects[statusId] = (enemy.statusEffects[statusId] || 0) + amount;
  return enemy.statusEffects[statusId];
}

export function setEnemyStatus(enemy, statusId, value) {
  enemy.statusEffects = enemy.statusEffects || {};
  enemy.statusEffects[statusId] = value;
  return enemy.statusEffects[statusId];
}

export function healEnemy(enemy, amount) {
  enemy.hp = Math.min(enemy.maxHp || enemy.hp, (enemy.hp || 0) + amount);
  return enemy.hp;
}

export function damageEnemy(enemy, amount) {
  enemy.hp = Math.max(0, enemy.hp - amount);
  return enemy.hp;
}

export function drawFromRandomPlayerPool(gs, pools, pickIndex) {
  let remaining = pickIndex;
  for (const pool of pools) {
    if (remaining < pool.cards.length) {
      const [cardId] = pool.cards.splice(remaining, 1);
      return { poolKey: pool.key, cardId };
    }
    remaining -= pool.cards.length;
  }
  return { poolKey: null, cardId: null };
}
