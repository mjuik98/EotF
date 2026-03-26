import { syncGlobalDepsFactoryHooks } from './deps_factory_global_bridge.js';
import { createPublicDepAccessors } from './deps_factory_public_accessors.js';
import { createPublicDepAccessorExportBindings } from './deps_factory_public_export_bindings.js';

export function createDepsFactoryPublicRuntime({ createDeps, getPublicDepAccessors = null } = {}) {
  const resolvePublicDepAccessors = typeof getPublicDepAccessors === 'function'
    ? getPublicDepAccessors
    : () => createPublicDepAccessors(createDeps);
  const publicDepAccessorExports = createPublicDepAccessorExportBindings(resolvePublicDepAccessors);

  function syncPublicGlobalHooks() {
    syncGlobalDepsFactoryHooks({
      getHudUpdateDeps: publicDepAccessorExports.getHudUpdateDeps,
    });
  }

  return Object.freeze({
    publicDepAccessorExports,
    syncPublicGlobalHooks,
  });
}
