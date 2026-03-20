export function applyCombatSessionCleanupReducerState(state) {
  const combat = state?.combat;
  if (!combat) return null;

  combat.active = false;
  combat.playerTurn = true;

  state._maskCount = 0;
  state._batteryUsedTurn = false;
  state._temporalTurn = 0;
  state._activeRegionId = null;
  state._ignoreShield = false;
  state._scrollTempCard = null;
  state._fragmentActive = false;
  state._fragmentBaseMax = undefined;
  state._glitch0 = null;
  state._glitchPlus = null;
  state._eternityActive = false;

  return {
    combatActive: combat.active,
    playerTurn: combat.playerTurn,
  };
}
