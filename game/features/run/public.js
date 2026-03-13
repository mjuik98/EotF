import {
  buildRunFlowModuleCapabilities,
  buildRunMapModuleCapabilities,
} from './platform/browser/run_module_capabilities.js';
import { createRunContractCapabilities } from './ports/contracts/public_run_contract_capabilities.js';
import {
  buildRunFlowContractPublicBuilders,
  buildRunReturnContractPublicBuilders,
  buildRunUiContractPublicBuilders,
} from './ports/contracts/public_run_contract_builders.js';
import {
  buildRunBootPublicActions,
  buildRunReturnRuntimePublicActions,
  createFinalizeRunOutcomeAction,
  createRunCanvasBindings,
  createRunRuntimeCapabilities,
  registerRunEntryBindings,
} from './ports/runtime/public_run_runtime_surface.js';
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

export function createRunFeatureFacade() {
  return {
    moduleCapabilities: createRunModuleCapabilities(),
    bindings: createRunBindingCapabilities(),
    contracts: createRunContractCapabilities(),
    runtime: createRunRuntimeCapabilities(),
  };
}

export const RunPublicSurface = Object.freeze({
  createRunFeatureFacade,
  createRunModuleCapabilities,
  createRunBindingCapabilities,
  createRunContractCapabilities,
  createRunRuntimeCapabilities,
  buildRunBootPublicActions,
  buildRunFlowContractPublicBuilders,
  buildRunReturnContractPublicBuilders,
  buildRunReturnRuntimePublicActions,
  buildRunUiContractPublicBuilders,
  createFinalizeRunOutcomeAction,
  createRunCanvasBindings,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  registerRunEntryBindings,
  RunRules,
});

export {
  buildRunBootPublicActions,
  buildRunReturnRuntimePublicActions,
  createRunContractCapabilities,
  createFinalizeRunOutcomeAction,
  createRunCanvasBindings,
  createRunRuntimeCapabilities,
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  registerRunEntryBindings,
  RunRules,
};
