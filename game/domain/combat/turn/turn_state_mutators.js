import { Actions } from '../../../core/store/state_actions.js';

function dispatchStateChange(gs, action, payload, fallback, readResult) {
  if (typeof gs?.dispatch === 'function') {
    const result = gs.dispatch(action, payload) || null;
    if (typeof readResult === 'function') {
      const value = readResult(result);
      if (value !== undefined) return value;
    }
  }
  return fallback();
}

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
  gs.player.energy = Math.max(0, amount);
  return gs.player.energy;
}

export function reducePlayerEnergy(gs, amount) {
  return setPlayerEnergy(gs, Math.max(0, gs.player.energy - amount));
}

export function setPlayerEcho(gs, amount) {
  const nextEcho = Math.max(0, Math.min(gs.player.maxEcho, amount));
  const delta = nextEcho - Number(gs.player.echo || 0);
  if (delta === 0) return nextEcho;
  return dispatchStateChange(
    gs,
    Actions.PLAYER_ECHO,
    { amount: delta },
    () => {
      gs.player.echo = nextEcho;
      return gs.player.echo;
    },
    (result) => result?.echoAfter,
  );
}

export function setPlayerEchoChain(gs, amount) {
  gs.player.echoChain = Math.max(0, amount);
  return gs.player.echoChain;
}

export function setPlayerShield(gs, amount) {
  const nextShield = Math.max(0, amount);
  const delta = nextShield - Number(gs.player.shield || 0);
  if (delta === 0) return nextShield;
  return dispatchStateChange(
    gs,
    Actions.PLAYER_SHIELD,
    { amount: delta },
    () => {
      gs.player.shield = nextShield;
      return gs.player.shield;
    },
    (result) => result?.shieldAfter,
  );
}

export function reducePlayerSilenceGauge(gs, amount) {
  return dispatchStateChange(
    gs,
    Actions.PLAYER_SILENCE,
    { amount: -Math.max(0, amount) },
    () => {
      gs.player.silenceGauge = Math.max(0, (gs.player.silenceGauge || 0) - amount);
      return gs.player.silenceGauge;
    },
    (result) => result?.silenceGauge,
  );
}

export function resetPlayerTimeRiftGauge(gs) {
  const currentGauge = Math.max(0, Number(gs.player.timeRiftGauge || 0));
  if (currentGauge === 0) return 0;
  return dispatchStateChange(
    gs,
    Actions.PLAYER_TIME_RIFT,
    { amount: -currentGauge },
    () => {
      gs.player.timeRiftGauge = 0;
      return gs.player.timeRiftGauge;
    },
    (result) => result?.timeRiftGauge,
  );
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
  if (typeof gs?.dispatch === 'function') {
    gs.dispatch(Actions.PLAYER_BUFF, { id: buffId, stacks, data: extra });
    return gs.player.buffs[buffId];
  }
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
