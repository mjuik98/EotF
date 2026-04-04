import { startPlayerTurnPolicy } from '../domain/turn/start_player_turn_policy.js';
import { resolveActiveRegionId } from '../ports/public_run_rule_capabilities.js';
import { createEndPlayerTurnPolicyCommands, createStartPlayerTurnPolicyCommands } from '../ports/player_turn_policy_ports.js';

export function createStartPlayerTurnAction(overrides = {}) {
  const commands = createStartPlayerTurnPolicyCommands({
    resolveActiveRegionId,
    ...overrides,
  });
  return (gs) => startPlayerTurnPolicy(gs, commands);
}

export function createEndPlayerTurnPolicyOptions(overrides = {}) {
  return {
    ...createEndPlayerTurnPolicyCommands({
      resolveActiveRegionId,
      ...overrides,
    }),
  };
}
