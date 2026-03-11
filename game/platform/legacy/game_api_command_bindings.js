import { buildLegacyGameAPICombatBindings } from './game_api_combat_bindings.js';
import { buildLegacyGameAPICodexBindings } from './game_api_codex_bindings.js';
import { buildLegacyGameAPIRewardBindings } from './game_api_reward_bindings.js';
import { buildLegacyGameAPIRunBindings } from './game_api_run_bindings.js';
import { buildLegacyGameAPISettingsBindings } from './game_api_settings_bindings.js';

export function buildLegacyGameAPICommandBindings(modules, fns) {
  return {
    ...buildLegacyGameAPICombatBindings(modules, fns),
    ...buildLegacyGameAPICodexBindings(modules, fns),
    ...buildLegacyGameAPIRewardBindings(modules, fns),
    ...buildLegacyGameAPIRunBindings(modules, fns),
    ...buildLegacyGameAPISettingsBindings(modules, fns),
  };
}
