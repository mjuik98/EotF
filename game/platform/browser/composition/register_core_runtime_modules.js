import { buildCoreEngineModules } from './build_core_engine_modules.js';
import { buildCoreRuntimeBridgeModules } from './build_core_runtime_bridge_modules.js';
import { buildCoreSystemModules } from './build_core_system_modules.js';

export function registerCoreModules() {
  return {
    ...buildCoreEngineModules(),
    ...buildCoreRuntimeBridgeModules(),
    ...buildCoreSystemModules(),
  };
}
