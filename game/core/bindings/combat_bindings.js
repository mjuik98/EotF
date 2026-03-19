import { createCombatBindingCapabilities } from '../../features/combat/public.js';

export function createCombatBindings(modules, fns) {
  const bindings = createCombatBindingCapabilities();
  Object.assign(fns, bindings.createCombatBindings(modules, fns));
}
