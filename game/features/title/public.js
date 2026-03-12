import { buildTitleBootActions } from './app/build_title_boot_actions.js';
import { createTitleActions } from './app/create_title_actions.js';
import { createTitlePauseMenuActions } from './application/help_pause_menu_actions.js';
import { buildTitleHelpPauseActions } from './application/help_pause_title_actions.js';
import {
  buildTitleCanvasModuleCatalog,
  buildTitleFlowModuleCatalog,
} from './modules/title_module_catalog.js';
import { buildTitleRunContractBuilders } from './ports/contracts/build_title_run_contracts.js';
import { buildTitleStoryContractBuilders } from './ports/contracts/build_title_story_contracts.js';
import { createTitleBindingPorts } from './platform/browser/create_title_binding_ports.js';

export function createTitleModuleCapabilities() {
  return {
    canvas: buildTitleCanvasPublicModules(),
    flow: buildTitlePublicModules(),
  };
}

export function createTitleBindingCapabilities() {
  return {
    createTitle: createTitleBindings,
  };
}

export function createTitleContractCapabilities() {
  return {
    buildRun: buildTitleRunContractPublicBuilders,
    buildStory: buildTitleStoryContractPublicBuilders,
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
    modules: createTitleModuleCapabilities(),
    bindings: createTitleBindingCapabilities(),
    contracts: createTitleContractCapabilities(),
    runtime: createTitleRuntimeCapabilities(),
  };
}

export function buildTitleCanvasPublicModules() {
  return buildTitleCanvasModuleCatalog();
}

export function buildTitlePublicModules() {
  return buildTitleFlowModuleCatalog();
}

export function createTitleBindings(modules, fns, options = {}) {
  return createTitleActions(createTitleBindingPorts(modules, fns, options));
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

export {
  buildTitleBootActions,
  buildTitleHelpPauseActions,
  createTitlePauseMenuActions,
  buildTitleRunContractBuilders,
  buildTitleStoryContractBuilders,
  createTitleActions,
  createTitleBindingPorts,
};
