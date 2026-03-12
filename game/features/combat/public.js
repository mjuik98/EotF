import {
  buildCombatCardBrowserModules,
  buildCombatCoreBrowserModules,
  buildCombatHudBrowserModules,
} from './platform/browser/combat_browser_modules.js';
export { SetBonusSystem } from './domain/set_bonus_system.js';
import { createCombatBindingsActions } from './bindings/public_combat_bindings.js';
import { createCombatStartRuntime } from './application/create_combat_start_runtime.js';
import { buildCombatFlowContractBuilders } from './ports/contracts/build_combat_flow_contracts.js';
import { buildCombatUiContractPublicBuilders } from './contracts/public_combat_contract_builders.js';
import { buildCombatRuntimeSubscriberPublicActions } from './runtime/public_combat_runtime_actions.js';

export function createCombatModuleCapabilities() {
  return {
    core: buildCombatCoreBrowserModules(),
    cards: buildCombatCardBrowserModules(),
    hud: buildCombatHudBrowserModules(),
  };
}

export function createCombatBindingCapabilities() {
  return {
    createCombatBindings: createCombatBindingsActions,
  };
}

export function createCombatContractCapabilities() {
  return {
    buildFlow: buildCombatFlowContractPublicBuilders,
    buildUi: buildCombatUiContractPublicBuilders,
  };
}

export function createCombatRuntimeCapabilities() {
  return {
    buildSubscriberActions: buildCombatRuntimeSubscriberPublicActions,
  };
}

export function createCombatFeatureFacade() {
  return {
    moduleCapabilities: createCombatModuleCapabilities(),
    bindings: createCombatBindingCapabilities(),
    contracts: createCombatContractCapabilities(),
    runtime: createCombatRuntimeCapabilities(),
  };
}

export {
  createCombatStartRuntime,
  createCombatBindingsActions,
  buildCombatRuntimeSubscriberPublicActions,
  buildCombatUiContractPublicBuilders,
};

export function buildCombatFlowContractPublicBuilders(ctx) {
  return buildCombatFlowContractBuilders(ctx);
}
