import * as commandCapabilities from './public_combat_command_application_capabilities.js';
import * as flowCapabilities from './public_combat_flow_application_capabilities.js';

export function createCombatApplicationCapabilities() {
  return {
    ...commandCapabilities,
    ...flowCapabilities,
  };
}

export * from './public_combat_command_application_capabilities.js';
export * from './public_combat_flow_application_capabilities.js';
