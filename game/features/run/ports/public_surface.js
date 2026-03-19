import { createRunBindingCapabilities } from './public_binding_capabilities.js';
import {
  createRunBrowserModuleCapabilities,
  ensureRunFlowBrowserModules,
} from './public_browser_modules.js';
import { createRunContractCapabilities } from './public_contract_capabilities.js';
import { createRunModuleCapabilities } from './public_module_capabilities.js';
import {
  createRunRuleCapabilities,
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
} from './public_rule_capabilities.js';
import { createRunStateCapabilities } from './public_state_capabilities.js';
import {
  buildRunFlowContractPublicBuilders,
  buildRunReturnContractPublicBuilders,
  buildRunUiContractPublicBuilders,
} from './contracts/public_run_contract_builders.js';
import {
  buildRunBootPublicActions,
  buildRunReturnRuntimePublicActions,
  createFinalizeRunOutcomeAction,
  createRunCanvasBindings,
  createRunRuntimeCapabilities,
  registerRunEntryBindings,
} from './public_runtime_capabilities.js';

export const RunPublicSurface = Object.freeze({
  bindings: createRunBindingCapabilities(),
  browserModules: createRunBrowserModuleCapabilities(),
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
