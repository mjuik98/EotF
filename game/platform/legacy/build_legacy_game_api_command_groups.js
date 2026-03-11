import { buildLegacyGameAPICombatBindings } from './game_api_combat_bindings.js';
import { buildLegacyGameAPICodexBindings } from './game_api_codex_bindings.js';
import { buildLegacyGameAPIRewardBindings } from './game_api_reward_bindings.js';
import { buildLegacyGameAPIRunBindings } from './game_api_run_bindings.js';
import { buildLegacyGameAPISettingsBindings } from './game_api_settings_bindings.js';

export function buildLegacyGameAPICommandGroups(modules, fns) {
  return {
    combat: buildLegacyGameAPICombatBindings(modules, fns),
    codex: buildLegacyGameAPICodexBindings(modules, fns),
    reward: buildLegacyGameAPIRewardBindings(modules, fns),
    run: buildLegacyGameAPIRunBindings(modules, fns),
    settings: buildLegacyGameAPISettingsBindings(modules, fns),
  };
}
