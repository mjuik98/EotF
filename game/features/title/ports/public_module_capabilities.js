import {
  buildTitleCanvasModuleCapabilities,
  buildTitleFlowModuleCapabilities,
} from '../platform/browser/title_module_capabilities.js';

export function createTitleModuleCapabilities() {
  return {
    canvas: buildTitleCanvasModuleCapabilities(),
    flow: buildTitleFlowModuleCapabilities(),
  };
}

export {
  buildTitleCanvasModuleCapabilities as buildTitleCanvasModuleCatalog,
  buildTitleFlowModuleCapabilities as buildTitleFlowModuleCatalog,
};
