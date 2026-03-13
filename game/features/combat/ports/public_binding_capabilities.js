import { createCombatBindingsActions } from './runtime/public_combat_runtime_surface.js';

export function createCombatBindingCapabilities() {
  return {
    createCombatBindings: createCombatBindingsActions,
  };
}
