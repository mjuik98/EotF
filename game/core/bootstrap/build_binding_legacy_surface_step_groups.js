import { attachLegacyWindowBindings } from '../../platform/legacy/public.js';
import {
  registerLegacyGameAPIBindings,
  registerLegacyGameModules,
} from '../../platform/legacy/public.js';

export function buildBindingLegacySurfaceStepGroups() {
  return {
    window: [
      ({ modules, fns, deps }) => {
        attachLegacyWindowBindings(modules, fns, deps);
      },
    ],
    api: [
      ({ modules, fns, deps, metrics }) => {
        registerLegacyGameAPIBindings(modules, fns, deps, metrics);
      },
    ],
    modules: [
      ({ modules }) => {
        registerLegacyGameModules(modules);
      },
    ],
  };
}
