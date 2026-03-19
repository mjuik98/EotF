import { createRunContractCapabilities } from './ports/public_contract_capabilities.js';
import { createRunBindingCapabilities } from './ports/public_binding_capabilities.js';
import {
  createRunBrowserModuleCapabilities,
  ensureRunFlowBrowserModules,
} from './ports/public_browser_modules.js';
import { createRunModuleCapabilities } from './ports/public_module_capabilities.js';
import {
  createRunRuleCapabilities,
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
} from './ports/public_rule_capabilities.js';
import { createRunStateCapabilities } from './ports/public_state_capabilities.js';
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

export function createRunFeatureFacade() {
  return {
    moduleCapabilities: createRunModuleCapabilities(),
    bindings: createRunBindingCapabilities(),
    browserModules: createRunBrowserModuleCapabilities(),
    contracts: createRunContractCapabilities(),
    rules: createRunRuleCapabilities(),
    state: createRunStateCapabilities(),
    runtime: createRunRuntimeCapabilities(),
  };
}

export const RunPublicSurface = Object.freeze({
  bindings: createRunBindingCapabilities(),
  browserModules: createRunBrowserModuleCapabilities(),
  createRunFeatureFacade,
  createRunModuleCapabilities,
  createRunBindingCapabilities,
  createRunBrowserModuleCapabilities,
  createRunContractCapabilities,
  createRunRuleCapabilities,
  createRunStateCapabilities,
  createRunRuntimeCapabilities,
  buildRunBootPublicActions,
  buildRunFlowContractPublicBuilders,
  buildRunReturnContractPublicBuilders,
  buildRunReturnRuntimePublicActions,
  buildRunUiContractPublicBuilders,
  contracts: createRunContractCapabilities(),
  createFinalizeRunOutcomeAction,
  createRunCanvasBindings,
  moduleCapabilities: createRunModuleCapabilities(),
  registerRunEntryBindings,
  rules: createRunRuleCapabilities(),
  state: createRunStateCapabilities(),
  runtime: createRunRuntimeCapabilities(),
});

export {
  buildRunBootPublicActions,
  buildRunReturnRuntimePublicActions,
  createRunBindingCapabilities,
  createRunBrowserModuleCapabilities,
  createRunContractCapabilities,
  createFinalizeRunOutcomeAction,
  createRunCanvasBindings,
  createRunModuleCapabilities,
  createRunRuntimeCapabilities,
  createRunStateCapabilities,
  ensureRunFlowBrowserModules,
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  registerRunEntryBindings,
  RunRules,
};
