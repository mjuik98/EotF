import {
  beginPlayerTurnState,
  consumePlayerBuffStackState,
  exhaustRandomPlayerCardState,
  finalizePlayerTurnEndState,
  reducePlayerTurnEnergyState,
  reducePlayerTurnMaxEchoState,
  reducePlayerTurnSilenceGaugeState,
  resetPlayerTurnTimeRiftState,
} from '../state/player_turn_state_commands.js';
import { drawStateCards } from '../application/public_combat_command_actions.js';

function drawPlayerCardsState(gs, count, options = {}) {
  return drawStateCards({
    count,
    gs,
    options,
  });
}

export function createStartPlayerTurnPolicyCommands(overrides = {}) {
  return {
    beginPlayerTurnState: overrides.beginPlayerTurnState || beginPlayerTurnState,
    consumePlayerBuffState: overrides.consumePlayerBuffState || consumePlayerBuffStackState,
    drawCardsState: overrides.drawCardsState || drawPlayerCardsState,
    exhaustRandomPlayerCardState: overrides.exhaustRandomPlayerCardState || exhaustRandomPlayerCardState,
    reducePlayerTurnEnergyState: overrides.reducePlayerTurnEnergyState || reducePlayerTurnEnergyState,
    reducePlayerTurnMaxEchoState: overrides.reducePlayerTurnMaxEchoState || reducePlayerTurnMaxEchoState,
    resolveActiveRegionId: overrides.resolveActiveRegionId,
  };
}

export function createEndPlayerTurnPolicyCommands(overrides = {}) {
  return {
    consumePlayerBuffState: overrides.consumePlayerBuffState || consumePlayerBuffStackState,
    finalizePlayerTurnEndState: overrides.finalizePlayerTurnEndState || finalizePlayerTurnEndState,
    reducePlayerTurnSilenceGaugeState: overrides.reducePlayerTurnSilenceGaugeState || reducePlayerTurnSilenceGaugeState,
    resolveActiveRegionId: overrides.resolveActiveRegionId,
    resetPlayerTurnTimeRiftState: overrides.resetPlayerTurnTimeRiftState || resetPlayerTurnTimeRiftState,
  };
}
