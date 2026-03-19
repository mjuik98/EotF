import { createCombatActions } from './create_combat_actions.js';
import { createCombatPorts } from '../../ports/create_combat_ports.js';

export function createCombatBindingsActions(modules, fns) {
  return createCombatActions(modules, fns, createCombatPorts(modules));
}
