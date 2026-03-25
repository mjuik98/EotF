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

export function applyCombatPlayerSetupReducerState(state) {
  const player = state?.player;
  if (!player) return null;

  player.shield = 0;
  player.echoChain = 0;
  player.energy = player.maxEnergy;
  player.buffs = collectPermanentBuffs(player);
  player.zeroCost = false;
  player.costDiscount = 0;
  player.drawCount = 0;
  player._nextCardDiscount = 0;
  player._freeCardUses = 0;
  player._cascadeCards = new Map();
  player._traitCardDiscounts = {};
  player._mageCastCounter = 0;
  player._mageLastDiscountTarget = null;

  return {
    energy: player.energy,
    buffs: player.buffs,
  };
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
