import { startPlayerTurnPolicy } from '../../../domain/combat/turn/start_player_turn_policy.js';
import { createEndPlayerTurnPolicyCommands, createStartPlayerTurnPolicyCommands } from '../ports/player_turn_policy_ports.js';

export function createStartPlayerTurnAction(overrides = {}) {
  const commands = createStartPlayerTurnPolicyCommands(overrides);
  return (gs) => startPlayerTurnPolicy(gs, commands);
}

export function createEndPlayerTurnPolicyOptions(overrides = {}) {
  return {
    ...createEndPlayerTurnPolicyCommands(overrides),
  };
}
