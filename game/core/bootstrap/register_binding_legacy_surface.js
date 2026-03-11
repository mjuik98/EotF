import { getRuntimeMetrics, resetRuntimeMetrics } from '../runtime_metrics.js';
import { attachLegacyWindowBindings } from '../../platform/legacy/window_bindings.js';
import {
  registerLegacyGameAPIBindings,
  registerLegacyGameModules,
} from '../../platform/legacy/game_api_registry.js';

export function registerBindingLegacySurface({ modules, fns, deps }) {
  attachLegacyWindowBindings(modules, fns, deps);
  registerLegacyGameAPIBindings(modules, fns, deps, {
    getRuntimeMetrics,
    resetRuntimeMetrics,
  });
  registerLegacyGameModules(modules);
}
