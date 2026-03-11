import { registerCombatModules } from '../composition/register_combat_modules.js';
import { registerCoreModules } from '../composition/register_core_modules.js';
import { registerRunModules } from '../composition/register_run_modules.js';
import { registerScreenModules } from '../composition/register_screen_modules.js';
import { registerTitleModules } from '../composition/register_title_modules.js';

/**
 * Builds a single module registry for composition root wiring.
 * Keeping this map out of main.js reduces entry-point fan-out.
 */
export function createModuleRegistry() {
  return {
    ...registerCoreModules(),
    ...registerTitleModules(),
    ...registerCombatModules(),
    ...registerRunModules(),
    ...registerScreenModules(),
    _gameStarted: false,
    _canvasRefs: null,
  };
}
