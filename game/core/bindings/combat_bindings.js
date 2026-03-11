import { createCombatActions } from '../../features/combat/app/combat_actions.js';
import { createCombatPorts } from '../../features/combat/ports/create_combat_ports.js';

export function createCombatBindings(modules, fns) {
    Object.assign(fns, createCombatActions(modules, fns, createCombatPorts(modules)));
}
