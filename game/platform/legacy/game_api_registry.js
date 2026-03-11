import { buildLegacyGameAPICommandBindings } from './game_api_command_bindings.js';
import { buildLegacyGameAPIQueryBindings } from './game_api_query_bindings.js';
import { registerLegacyGameModules } from './game_module_registry.js';

export function registerLegacyGameAPIBindings(modules, fns, deps, runtimeMetrics) {
  Object.assign(modules.GAME.API, {
    ...buildLegacyGameAPIQueryBindings(modules, deps, runtimeMetrics),
    ...buildLegacyGameAPICommandBindings(modules, fns),
  });
}

export { registerLegacyGameModules } from './game_module_registry.js';
