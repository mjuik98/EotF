import { registerCombatModules } from '../composition/register_combat_modules.js';
import { registerCoreModules } from '../composition/register_core_modules.js';
import { registerRunModules } from '../composition/register_run_modules.js';
import { registerScreenModules } from '../composition/register_screen_modules.js';
import { registerTitleModules } from '../composition/register_title_modules.js';

export function buildModuleRegistryGroupRegistrars() {
  return {
    foundation: {
      core: registerCoreModules,
      title: registerTitleModules,
    },
    gameplay: {
      combat: registerCombatModules,
      run: registerRunModules,
    },
    shell: {
      screen: registerScreenModules,
    },
  };
}
