export { ClassProgressionSystem } from '../domain/class_progression_system.js';
import { createTitleBindingCapabilities } from './public_binding_capabilities.js';
import { createTitleContractCapabilities } from './public_contract_capabilities.js';
import { createTitleModuleCapabilities } from './public_module_capabilities.js';
import { buildTitleRunContractBuilders } from './contracts/build_title_run_contracts.js';
import { buildTitleStoryContractBuilders } from './contracts/build_title_story_contracts.js';
import {
  buildTitleBootPublicActions,
  buildTitleHelpPausePublicActions,
  buildTitlePauseMenuPublicActions,
  createTitleBindings,
  createTitleRuntimeCapabilities,
  registerTitleBindings,
} from './runtime/public_title_runtime_surface.js';

export function createTitleFeatureFacade() {
  return {
    moduleCapabilities: createTitleModuleCapabilities(),
    bindings: createTitleBindingCapabilities(),
    contracts: createTitleContractCapabilities(),
    runtime: createTitleRuntimeCapabilities(),
  };
}

export const TitlePublicSurface = Object.freeze({
  createTitleBindingCapabilities,
  createTitleBindings,
  createTitleContractCapabilities,
  createTitleFeatureFacade,
  createTitleModuleCapabilities,
  createTitleRuntimeCapabilities,
  registerTitleBindings,
  buildTitleBootPublicActions,
  buildTitleHelpPausePublicActions,
  buildTitlePauseMenuPublicActions,
  buildTitleRunContractPublicBuilders,
  buildTitleStoryContractPublicBuilders,
});

export function buildTitleRunContractPublicBuilders(ctx) {
  return buildTitleRunContractBuilders(ctx);
}

export function buildTitleStoryContractPublicBuilders(ctx) {
  return buildTitleStoryContractBuilders(ctx);
}

export {
  createTitleBindingCapabilities,
  createTitleBindings,
  createTitleContractCapabilities,
  createTitleModuleCapabilities,
};
export {
  buildTitleBootPublicActions,
  buildTitleHelpPausePublicActions,
  buildTitlePauseMenuPublicActions,
  createTitleRuntimeCapabilities,
  registerTitleBindings,
};
