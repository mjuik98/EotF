import { buildLegacyGameAPICommandBindings } from './game_api_command_bindings.js';
import { buildLegacyGameAPIQueryBindings } from './game_api_query_bindings.js';
import { buildLegacyGameApiPayload } from './build_legacy_game_api_payload.js';
import { resolveLegacyModuleBag } from './resolve_legacy_module_bag.js';

export function buildLegacyGameApiRegistrationPayload({
  modules,
  fns,
  deps,
  runtimeMetrics,
} = {}) {
  const legacyModules = resolveLegacyModuleBag(modules);
  const commandBindings = buildLegacyGameAPICommandBindings(legacyModules, fns);
  const queryBindings = buildLegacyGameAPIQueryBindings(legacyModules, deps, runtimeMetrics);

  return {
    commandBindings,
    queryBindings,
    apiPayload: buildLegacyGameApiPayload({
      commandBindings,
      queryBindings,
    }),
  };
}
