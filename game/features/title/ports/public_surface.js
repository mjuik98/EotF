import { createTitleBindingCapabilities } from './public_binding_capabilities.js';
import { createTitleContractCapabilities } from './public_contract_capabilities.js';
import { createTitleModuleCapabilities } from './public_module_capabilities.js';
import {
  createTitleRuntimeCapabilities,
} from './runtime/public_title_runtime_surface.js';

export const TitlePublicSurface = Object.freeze({
  bindings: createTitleBindingCapabilities(),
  contracts: createTitleContractCapabilities(),
  moduleCapabilities: createTitleModuleCapabilities(),
  runtime: createTitleRuntimeCapabilities(),
});

export {
  createTitleBindingCapabilities,
  createTitleContractCapabilities,
  createTitleModuleCapabilities,
  createTitleRuntimeCapabilities,
};
