import { createTitleContractCapabilities } from './ports/public_contract_capabilities.js';
import { createTitleBindingCapabilities } from './ports/public_binding_capabilities.js';
import { createTitleModuleCapabilities } from './ports/public_module_capabilities.js';
import { buildTitleRunContractBuilders } from './ports/contracts/build_title_run_contracts.js';
import { buildTitleStoryContractBuilders } from './ports/contracts/build_title_story_contracts.js';
import {
  buildTitleBootPublicActions,
  buildTitleHelpPausePublicActions,
  buildTitlePauseMenuPublicActions,
  createTitleBindings,
  createTitleRuntimeCapabilities,
  registerTitleBindings,
} from './ports/runtime/public_title_runtime_surface.js';
export { ClassProgressionSystem } from './domain/class_progression_system.js';

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

export { createTitleBindings, createTitleContractCapabilities };
export {
  buildTitleBootPublicActions,
  buildTitleHelpPausePublicActions,
  buildTitlePauseMenuPublicActions,
  createTitleRuntimeCapabilities,
  registerTitleBindings,
};
