import {
  buildCombatCardBrowserModules,
  buildCombatCoreBrowserModules,
  buildCombatHudBrowserModules,
} from './platform/browser/combat_browser_modules.js';
export { SetBonusSystem } from './domain/set_bonus_system.js';
import { createCombatBindingsActions } from './platform/browser/create_combat_bindings.js';
import { createCombatStartRuntime } from './application/create_combat_start_runtime.js';
import { createCombatContractCapabilities } from './ports/contracts/public_combat_contract_capabilities.js';
import { buildCombatFlowContractBuilders } from './ports/contracts/build_combat_flow_contracts.js';
import { buildCombatUiContractPublicBuilders } from './ports/contracts/public_combat_contract_builders.js';
import { buildCombatRuntimeSubscriberActions } from './application/build_combat_runtime_subscriber_actions.js';
import {
  discardStateCard,
  drawStateCards,
  executePlayerDrawService,
  playStateCard,
} from './application/public_combat_command_actions.js';

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
  createCombatContractCapabilities,
  buildCombatUiContractPublicBuilders,
  discardStateCard,
  drawStateCards,
  executePlayerDrawService,
  playStateCard,
};

export function buildCombatFlowContractPublicBuilders(ctx) {
  return buildCombatFlowContractBuilders(ctx);
}

export function buildCombatRuntimeSubscriberPublicActions(fns) {
  return buildCombatRuntimeSubscriberActions(fns);
}
