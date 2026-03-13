import {
  buildTitleCanvasModuleCapabilities,
  buildTitleFlowModuleCapabilities,
} from './platform/browser/title_module_capabilities.js';
import { createTitleContractCapabilities } from './ports/contracts/public_title_contract_capabilities.js';
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

export function createTitleModuleCapabilities() {
  return {
    canvas: buildTitleCanvasModuleCapabilities(),
    flow: buildTitleFlowModuleCapabilities(),
  };
}

export function createTitleBindingCapabilities() {
  return {
    createTitle: createTitleBindings,
  };
}

export function createTitleFeatureFacade() {
  return {
    moduleCapabilities: createTitleModuleCapabilities(),
    bindings: createTitleBindingCapabilities(),
    contracts: createTitleContractCapabilities(),
    runtime: createTitleRuntimeCapabilities(),
  };
}

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
