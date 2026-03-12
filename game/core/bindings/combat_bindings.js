import { createCombatBindingsActions } from '../../features/combat/bindings/public_combat_bindings.js';

export function createCombatBindings(modules, fns) {
    Object.assign(fns, createCombatBindingsActions(modules, fns));
}
