import { buildLegacyGameAPICommandBindings } from './game_api_command_bindings.js';
import { buildLegacyGameAPIQueryBindings } from './game_api_query_bindings.js';
import { buildLegacyGameApiPayload } from './build_legacy_game_api_payload.js';
import { createLegacyGameApi } from './create_legacy_game_api.js';
import { registerLegacyGameModules } from './game_module_registry.js';

export function registerLegacyGameAPIBindings(modules, fns, deps, runtimeMetrics) {
  const commandBindings = buildLegacyGameAPICommandBindings(modules, fns);
  const queryBindings = buildLegacyGameAPIQueryBindings(modules, deps, runtimeMetrics);
  const apiPayload = buildLegacyGameApiPayload({ commandBindings, queryBindings });

  Object.assign(modules.GAME.API, createLegacyGameApi(apiPayload));
}

export { registerLegacyGameModules } from './game_module_registry.js';
