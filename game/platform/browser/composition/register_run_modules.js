import { buildRunMapModules } from './build_run_map_modules.js';
import { buildRunFlowModules } from './build_run_flow_modules.js';

export function registerRunModules() {
  return {
    ...buildRunMapModules(),
    ...buildRunFlowModules(),
  };
}
