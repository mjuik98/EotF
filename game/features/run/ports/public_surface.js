import { createRunBindingCapabilities } from './public_binding_capabilities.js';
import {
  createRunBrowserModuleCapabilities,
  ensureRunFlowBrowserModules,
} from './public_browser_modules.js';
import { createRunContractCapabilities } from './public_contract_capabilities.js';
import { createRunModuleCapabilities } from './public_module_capabilities.js';
import {
  createRunRuleCapabilities,
} from './public_rule_capabilities.js';
import { createRunStateCapabilities } from './public_state_capabilities.js';
import { createRunRuntimeCapabilities } from './public_runtime_capabilities.js';

export const RunPublicSurface = Object.freeze({
  bindings: createRunBindingCapabilities(),
  browserModules: createRunBrowserModuleCapabilities(),
  contracts: createRunContractCapabilities(),
  moduleCapabilities: createRunModuleCapabilities(),
  rules: createRunRuleCapabilities(),
  state: createRunStateCapabilities(),
  runtime: createRunRuntimeCapabilities(),
});

export {
  createRunBindingCapabilities,
  createRunBrowserModuleCapabilities,
  createRunContractCapabilities,
  createRunModuleCapabilities,
  createRunRuleCapabilities,
  createRunRuntimeCapabilities,
  createRunStateCapabilities,
};
