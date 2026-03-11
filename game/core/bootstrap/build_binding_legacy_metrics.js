import { getRuntimeMetrics, resetRuntimeMetrics } from '../runtime_metrics.js';

export function buildBindingLegacyMetrics() {
  return {
    getRuntimeMetrics,
    resetRuntimeMetrics,
  };
}
