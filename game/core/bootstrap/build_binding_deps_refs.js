import { resolveModuleRegistryLegacyCompat } from '../bindings/resolve_module_registry_legacy_compat.js';

export function buildBindingDepsRefs({ modules, fns }) {
  const legacyModules = resolveModuleRegistryLegacyCompat(modules);

  return {
    ...legacyModules,
    ...fns,
  };
}
