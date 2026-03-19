import { buildLegacyGameApiRegistrationPayload } from './build_legacy_game_api_registration_payload.js';
import { createLegacyGameApi } from './create_legacy_game_api.js';
import { registerLegacyGameModules } from './game_module_registry.js';
import { resolveLegacyApiRoot } from './resolve_legacy_module_bag.js';
import { assignLegacyCompatSurface } from '../../shared/runtime/public.js';

export function registerLegacyGameAPIBindings(modules, fns, deps, runtimeMetrics) {
  const { apiPayload } = buildLegacyGameApiRegistrationPayload({
    modules,
    fns,
    deps,
    runtimeMetrics,
  });

  assignLegacyCompatSurface(resolveLegacyApiRoot(modules), createLegacyGameApi(apiPayload));
}

export { registerLegacyGameModules } from './game_module_registry.js';
