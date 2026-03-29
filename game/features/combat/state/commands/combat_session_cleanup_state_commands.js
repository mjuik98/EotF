import { clearHandScopedRuntimeState } from '../../ports/public_hand_runtime_state_capabilities.js';

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
  clearHandScopedRuntimeState(state);
  state._eternityActive = false;

  return {
    combatActive: combat.active,
    playerTurn: combat.playerTurn,
  };
}
