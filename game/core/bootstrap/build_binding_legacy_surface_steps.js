import { attachLegacyWindowBindings } from '../../platform/legacy/window_bindings.js';
import {
  registerLegacyGameAPIBindings,
  registerLegacyGameModules,
} from '../../platform/legacy/game_api_registry.js';

export function buildBindingLegacySurfaceSteps() {
  return [
    ({ modules, fns, deps }) => {
      attachLegacyWindowBindings(modules, fns, deps);
    },
    ({ modules, fns, deps, metrics }) => {
      registerLegacyGameAPIBindings(modules, fns, deps, metrics);
    },
    ({ modules }) => {
      registerLegacyGameModules(modules);
    },
  ];
}
