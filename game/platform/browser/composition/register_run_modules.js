import {
  buildRunFlowPublicModules,
  buildRunMapPublicModules,
} from '../../../features/run/modules/public_run_modules.js';

export function registerRunModules() {
  return {
    ...buildRunMapPublicModules(),
    ...buildRunFlowPublicModules(),
  };
}
