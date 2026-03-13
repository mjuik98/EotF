import { createCombatBindingsActions } from '../../features/combat/public.js';

export function createCombatBindings(modules, fns) {
    Object.assign(fns, createCombatBindingsActions(modules, fns));
}
