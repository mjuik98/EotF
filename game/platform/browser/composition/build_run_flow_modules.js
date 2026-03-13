import { createRunModuleCapabilities } from '../../../features/run/ports/public_module_capabilities.js';

export function buildRunFlowModules() {
  return createRunModuleCapabilities().flow;
}
