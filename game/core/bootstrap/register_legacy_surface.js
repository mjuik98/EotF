import { registerLegacyBridgeRuntime } from '../../platform/legacy/public.js';

export function registerLegacySurface({ modules, fns }) {
  return registerLegacyBridgeRuntime({ modules, fns });
}
