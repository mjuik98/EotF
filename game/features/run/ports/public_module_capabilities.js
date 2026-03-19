import {
  buildRunFlowModuleCapabilities,
  buildRunMapModuleCapabilities,
} from '../platform/browser/run_module_capabilities.js';

export function buildRunMapPublicModules() {
  return buildRunMapModuleCapabilities();
}

export function buildRunFlowPublicModules() {
  return buildRunFlowModuleCapabilities();
}

export function createRunModuleCapabilities() {
  return {
    map: buildRunMapPublicModules(),
    flow: buildRunFlowPublicModules(),
  };
}
