import { createCombatBindingCapabilities } from '../../features/combat/ports/public_binding_capabilities.js';

export function createCombatBindings(modules, fns) {
  const bindings = createCombatBindingCapabilities();
  Object.assign(fns, bindings.createCombatBindings(modules, fns));
}
