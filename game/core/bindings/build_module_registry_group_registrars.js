import { registerCodexModules } from '../composition/register_codex_modules.js';
import { registerCombatModules } from '../composition/register_combat_modules.js';
import { registerCoreModules } from '../composition/register_core_modules.js';
import { registerEventModules } from '../composition/register_event_modules.js';
import { registerRewardModules } from '../composition/register_reward_modules.js';
import { registerRunModules } from '../composition/register_run_modules.js';
import { registerScreenModules } from '../composition/register_screen_modules.js';
import { registerTitleModules } from '../composition/register_title_modules.js';

export function buildModuleRegistryGroupRegistrars() {
  return {
    foundation: {
      core: registerCoreModules,
      title: registerTitleModules,
      codex: registerCodexModules,
      event: registerEventModules,
      reward: registerRewardModules,
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
