import { createTitleModuleCapabilities } from '../../../features/title/ports/public_module_capabilities.js';

export function buildTitleCanvasModules() {
  return createTitleModuleCapabilities().canvas;
}
