import { buildTitleBootActions } from './application/build_title_boot_actions.js';
import { createTitlePauseMenuActions } from './application/help_pause_menu_actions.js';
import { buildTitleHelpPauseActions } from './application/help_pause_title_actions.js';
import {
  buildTitleCanvasModuleCapabilities,
  buildTitleFlowModuleCapabilities,
} from './platform/browser/title_module_capabilities.js';
import { createTitleContractCapabilities } from './ports/contracts/public_title_contract_capabilities.js';
import { buildTitleRunContractBuilders } from './ports/contracts/build_title_run_contracts.js';
import { buildTitleStoryContractBuilders } from './ports/contracts/build_title_story_contracts.js';
import { createTitleBindings } from './platform/browser/create_title_bindings.js';
import { registerTitleBindings as registerTitleBrowserBindings } from './platform/browser/register_title_bindings.js';
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

export function createTitleRuntimeCapabilities() {
  return {
    buildBootActions: buildTitleBootPublicActions,
    buildHelpPauseActions: buildTitleHelpPausePublicActions,
    buildPauseMenuActions: buildTitlePauseMenuPublicActions,
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

export function buildTitleBootPublicActions(fns) {
  return buildTitleBootActions(fns);
}

export function buildTitleRunContractPublicBuilders(ctx) {
  return buildTitleRunContractBuilders(ctx);
}

export function buildTitleStoryContractPublicBuilders(ctx) {
  return buildTitleStoryContractBuilders(ctx);
}

export function buildTitleHelpPausePublicActions(deps = {}) {
  return buildTitleHelpPauseActions(deps);
}

export function buildTitlePauseMenuPublicActions(options = {}) {
  return createTitlePauseMenuActions(options);
}

export function registerTitleBindings(options = {}) {
  return registerTitleBrowserBindings(options);
}

export { createTitleBindings, createTitleContractCapabilities };
