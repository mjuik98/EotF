export function setCombatCardPlayLockState(state, isPlaying) {
  if (!state?.combat) return false;
  state.combat._isPlayingCard = Boolean(isPlaying);
  return state.combat._isPlayingCard;
}

export function removeCardFromHandState(state, handIdx) {
  const hand = state?.player?.hand;
  if (!Array.isArray(hand) || handIdx < 0 || handIdx >= hand.length) return null;
  return hand.splice(handIdx, 1)[0] ?? null;
}

export function restorePlayerHandState(state, hand) {
  if (!state?.player) return [];
  state.player.hand = Array.isArray(hand) ? [...hand] : [];
  return state.player.hand;
}

export function consumeNextCardDiscountState(state) {
  const player = state?.player;
  if (!player) return 0;
  player._nextCardDiscount = Math.max(0, Number(player._nextCardDiscount || 0) - 1);
  return player._nextCardDiscount;
}

export function incrementCardsPlayedState(state) {
  if (!state?.stats) return 0;
  state.stats.cardsPlayed = Number(state.stats.cardsPlayed || 0) + 1;
  return state.stats.cardsPlayed;
}
