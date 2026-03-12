import {
  buildRunFlowPublicModules,
  buildRunMapPublicModules,
} from '../../../features/run/public.js';

export function registerRunModules() {
  return {
    ...buildRunMapPublicModules(),
    ...buildRunFlowPublicModules(),
  };
}
