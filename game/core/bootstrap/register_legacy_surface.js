import { registerLegacyBridgeRuntime } from '../../platform/legacy/register_legacy_bridge_runtime.js';

export function registerLegacySurface({ modules, fns }) {
  return registerLegacyBridgeRuntime({ modules, fns });
}
