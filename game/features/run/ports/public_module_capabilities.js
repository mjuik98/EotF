import {
  buildRunFlowModuleCapabilities,
  buildRunMapModuleCapabilities,
} from '../platform/browser/run_module_capabilities.js';

export function createRunModuleCapabilities() {
  return {
    map: buildRunMapModuleCapabilities(),
    flow: buildRunFlowModuleCapabilities(),
  };
}
