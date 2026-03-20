import { resolveModuleRegistryLegacyGameRoot } from '../bindings/resolve_module_registry_legacy_compat.js';

export function executeLegacySurfaceRegistration({ modules, payload }) {
  resolveModuleRegistryLegacyGameRoot(modules)?.init?.(...payload.initArgs);
  modules.exposeGlobals(payload.globals);
}
