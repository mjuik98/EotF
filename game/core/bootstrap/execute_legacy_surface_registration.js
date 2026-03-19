import { resolveModuleRegistryLegacyCompat } from '../bindings/resolve_module_registry_legacy_compat.js';

export function executeLegacySurfaceRegistration({ modules, payload }) {
  resolveModuleRegistryLegacyCompat(modules).GAME.init(...payload.initArgs);
  modules.exposeGlobals(payload.globals);
}
