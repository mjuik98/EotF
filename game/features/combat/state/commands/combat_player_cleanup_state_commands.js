export function applyCombatPlayerCleanupReducerState(state) {
  const player = state?.player;
  if (!player) return null;

  player.hand = [];
  player.graveyard = [];
  player.exhausted = [];
  player.drawPile = [];
  player.discardPile = [];
  player.silenceGauge = 0;
  player.timeRiftGauge = 0;

  return {
    handSize: player.hand.length,
    graveyardSize: player.graveyard.length,
    exhaustedSize: player.exhausted.length,
  };
}
