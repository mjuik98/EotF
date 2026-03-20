import { createUiBindingCapabilities } from './public_binding_capabilities.js';
import {
  createUiBrowserModuleCapabilities,
} from './public_browser_modules.js';
import { createUiContractCapabilities } from './public_contract_capabilities.js';
import { createUiModuleCapabilities } from './public_module_capabilities.js';
import { createUiRuntimeCapabilities } from './runtime/public_ui_runtime_surface.js';

export const UiPublicSurface = Object.freeze({
  bindings: createUiBindingCapabilities(),
  browserModules: createUiBrowserModuleCapabilities(),
  contracts: createUiContractCapabilities(),
  moduleCapabilities: createUiModuleCapabilities(),
  runtime: createUiRuntimeCapabilities(),
});

export {
  createUiBindingCapabilities,
  createUiBrowserModuleCapabilities,
  createUiContractCapabilities,
  createUiModuleCapabilities,
  createUiRuntimeCapabilities,
};
