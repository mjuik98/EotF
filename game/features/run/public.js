import {
  buildRunFlowModuleCapabilities,
  buildRunMapModuleCapabilities,
} from './platform/browser/run_module_capabilities.js';
import { createRunCanvasBindings } from './platform/browser/create_run_canvas_bindings.js';
import { registerRunEntryBindings as registerRunEntryBrowserBindings } from './platform/browser/register_run_entry_bindings.js';
import { createRunContractCapabilities } from './ports/contracts/public_run_contract_capabilities.js';
import {
  buildRunFlowContractPublicBuilders,
  buildRunReturnContractPublicBuilders,
  buildRunUiContractPublicBuilders,
} from './ports/contracts/public_run_contract_builders.js';
import { buildRunBootActions } from './application/build_run_boot_actions.js';
import { bindFinalizeRunOutcome } from './application/bind_run_outcome_action.js';
import { buildRunReturnRuntimeActions } from './application/build_run_return_runtime_actions.js';
import {
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
} from './application/run_rules.js';

export function createRunModuleCapabilities() {
  return {
    map: buildRunMapModuleCapabilities(),
    flow: buildRunFlowModuleCapabilities(),
  };
}

export function createRunBindingCapabilities() {
  return {
    createCanvas: createRunCanvasBindings,
  };
}

export function createRunRuntimeCapabilities() {
  return {
    buildBootActions: buildRunBootPublicActions,
    buildReturnActions: buildRunReturnRuntimePublicActions,
  };
}

export function createRunFeatureFacade() {
  return {
    moduleCapabilities: createRunModuleCapabilities(),
    bindings: createRunBindingCapabilities(),
    contracts: createRunContractCapabilities(),
    runtime: createRunRuntimeCapabilities(),
  };
}

export function registerRunEntryBindings(options = {}) {
  return registerRunEntryBrowserBindings(options);
}

export function buildRunBootPublicActions(fns) {
  return buildRunBootActions(fns);
}

export function buildRunReturnRuntimePublicActions() {
  return buildRunReturnRuntimeActions();
}

export function createFinalizeRunOutcomeAction(saveSystem, getGameState = null) {
  return (kind = 'defeat', options = {}, extraDeps = {}) => bindFinalizeRunOutcome(
    finalizeRunOutcome,
    saveSystem,
  )(kind, options, { getGameState, ...extraDeps });
}

export {
  createRunContractCapabilities,
  createRunCanvasBindings,
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
};
