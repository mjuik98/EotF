import { registerLegacyBridge } from '../../platform/legacy/public.js';

export function registerLegacySurface({ modules, fns }) {
  return registerLegacyBridge({ modules, fns });
}
