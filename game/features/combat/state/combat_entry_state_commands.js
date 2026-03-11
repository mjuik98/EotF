export function applyCombatStartReducerState(state) {
  const combat = state?.combat;
  if (!combat) return null;

  combat.active = true;
  combat.turn = 0;
  combat.playerTurn = true;
  combat.log = [];
  state.currentScreen = 'game';

  return {
    active: combat.active,
    turn: combat.turn,
    playerTurn: combat.playerTurn,
    currentScreen: state.currentScreen,
  };
}

export function setActiveCombatRegionState(state, region) {
  const regionId = Number(region?.id);
  state._activeRegionId = Number.isFinite(regionId) ? regionId : null;
  return state._activeRegionId;
}
