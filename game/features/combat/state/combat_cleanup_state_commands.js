import { resetCombatSetupState } from './combat_setup_state_commands.js';

export function applyCombatEndCleanupState(state) {
  const combat = state?.combat;
  const player = state?.player;
  if (!combat || !player) return null;

  combat.active = false;
  combat.playerTurn = true;

  player.hand = [];
  resetCombatSetupState(state);

  player.graveyard = [];
  player.exhausted = [];
  player.drawPile = [];
  player.discardPile = [];

  player.silenceGauge = 0;
  player.timeRiftGauge = 0;
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
