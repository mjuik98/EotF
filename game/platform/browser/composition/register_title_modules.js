import { createTitleModuleCapabilities } from '../../../features/title/ports/public_module_capabilities.js';

export function buildTitleCanvasModuleRegistry() {
  return createTitleModuleCapabilities().canvas;
}

export function buildTitleFlowModuleRegistry() {
  return createTitleModuleCapabilities().flow;
}

export function registerTitleModules() {
  const modules = createTitleModuleCapabilities();
  return {
    ...modules.canvas,
    ...modules.flow,
  };
}
