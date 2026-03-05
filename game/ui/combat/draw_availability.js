function normalizeHandCapMinus(rawValue) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

export function resolvePlayerMaxHand(player = {}) {
  return Math.max(1, 8 - normalizeHandCapMinus(player?._handCapMinus));
}

export function resolvePlayerHand(player = {}) {
  return Array.isArray(player?.hand) ? player.hand : [];
}

export function resolveDrawAvailability(gs = {}) {
  const player = gs?.player || {};
  const combat = gs?.combat || {};
  const hand = resolvePlayerHand(player);
  const maxHand = resolvePlayerMaxHand(player);
  const handFull = hand.length >= maxHand;
  const numericEnergy = Number(player.energy);
  const hasEnergy = Number.isFinite(numericEnergy) && numericEnergy >= 1;
  const inCombat = !!combat.active;
  const playerTurn = !!combat.playerTurn;

  return {
    canDraw: inCombat && playerTurn && hasEnergy && !handFull,
    inCombat,
    playerTurn,
    hasEnergy,
    handFull,
    maxHand,
    handCount: hand.length,
  };
}
