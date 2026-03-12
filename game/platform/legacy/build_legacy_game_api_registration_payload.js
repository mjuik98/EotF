import { buildLegacyGameAPICommandBindings } from './game_api_command_bindings.js';
import { buildLegacyGameAPIQueryBindings } from './game_api_query_bindings.js';
import { buildLegacyGameApiPayload } from './build_legacy_game_api_payload.js';

export function buildLegacyGameApiRegistrationPayload({
  modules,
  fns,
  deps,
  runtimeMetrics,
} = {}) {
  const commandBindings = buildLegacyGameAPICommandBindings(modules, fns);
  const queryBindings = buildLegacyGameAPIQueryBindings(modules, deps, runtimeMetrics);

  return {
    commandBindings,
    queryBindings,
    apiPayload: buildLegacyGameApiPayload({
      commandBindings,
      queryBindings,
    }),
  };
}
