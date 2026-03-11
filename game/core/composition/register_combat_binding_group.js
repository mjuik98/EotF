import { createCombatBindings } from '../bindings/combat_bindings.js';

export function registerCombatBindingGroup(modules, fns) {
  createCombatBindings(modules, fns);
}
