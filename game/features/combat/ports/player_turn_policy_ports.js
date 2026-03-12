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

export function createStartPlayerTurnPolicyCommands(overrides = {}) {
  return {
    beginPlayerTurnState: overrides.beginPlayerTurnState || beginPlayerTurnState,
    consumePlayerBuffState: overrides.consumePlayerBuffState || consumePlayerBuffStackState,
    exhaustRandomPlayerCardState: overrides.exhaustRandomPlayerCardState || exhaustRandomPlayerCardState,
    reducePlayerTurnEnergyState: overrides.reducePlayerTurnEnergyState || reducePlayerTurnEnergyState,
    reducePlayerTurnMaxEchoState: overrides.reducePlayerTurnMaxEchoState || reducePlayerTurnMaxEchoState,
  };
}

export function createEndPlayerTurnPolicyCommands(overrides = {}) {
  return {
    consumePlayerBuffState: overrides.consumePlayerBuffState || consumePlayerBuffStackState,
    finalizePlayerTurnEndState: overrides.finalizePlayerTurnEndState || finalizePlayerTurnEndState,
    reducePlayerTurnSilenceGaugeState: overrides.reducePlayerTurnSilenceGaugeState || reducePlayerTurnSilenceGaugeState,
    resetPlayerTurnTimeRiftState: overrides.resetPlayerTurnTimeRiftState || resetPlayerTurnTimeRiftState,
  };
}
