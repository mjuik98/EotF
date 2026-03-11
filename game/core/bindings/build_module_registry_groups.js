import { registerCombatModules } from '../composition/register_combat_modules.js';
import { registerCoreModules } from '../composition/register_core_modules.js';
import { registerRunModules } from '../composition/register_run_modules.js';
import { registerScreenModules } from '../composition/register_screen_modules.js';
import { registerTitleModules } from '../composition/register_title_modules.js';

export function buildModuleRegistryGroups() {
  return {
    core: registerCoreModules(),
    title: registerTitleModules(),
    combat: registerCombatModules(),
    run: registerRunModules(),
    screen: registerScreenModules(),
  };
}
