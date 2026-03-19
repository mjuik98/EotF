import { createCombatBindingsActions } from './public_runtime_capabilities.js';

export function createCombatBindingCapabilities() {
  return {
    createCombatBindings: createCombatBindingsActions,
  };
}

export { createCombatBindingsActions };
