import { createRunModuleCapabilities } from '../../../features/run/ports/public_module_capabilities.js';

export function buildRunMapModuleRegistry() {
  return createRunModuleCapabilities().map;
}

export function buildRunFlowModuleRegistry() {
  return createRunModuleCapabilities().flow;
}

export function registerRunModules() {
  const modules = createRunModuleCapabilities();
  return {
    ...modules.map,
    ...modules.flow,
  };
}
