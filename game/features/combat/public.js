import {
  buildCombatCardBrowserModules,
  buildCombatCoreBrowserModules,
  buildCombatHudBrowserModules,
} from './platform/browser/combat_browser_modules.js';
export { SetBonusSystem } from './domain/set_bonus_system.js';
import { createCombatStartRuntime } from './application/create_combat_start_runtime.js';
import { CombatLifecycle } from './application/combat_lifecycle_compat.js';
import { createCombatContractCapabilities } from './ports/contracts/public_combat_contract_capabilities.js';
import { DeathHandler } from './application/death_handler_compat.js';
import { buildCombatFlowContractBuilders } from './ports/contracts/build_combat_flow_contracts.js';
import { buildCombatUiContractPublicBuilders } from './ports/contracts/public_combat_contract_builders.js';
import {
  buildCombatRuntimeSubscriberPublicActions,
  createCombatBindingsActions,
  createCombatRuntimeCapabilities,
} from './ports/runtime/public_combat_runtime_surface.js';
import { CardMethods } from './application/card_methods_compat.js';
import { CombatMethods } from './application/combat_methods_compat.js';
import {
  discardStateCard,
  drawStateCards,
  executePlayerDrawService,
  playStateCard,
} from './application/public_combat_command_actions.js';
import { DamageSystem } from './application/damage_system_compat.js';
import { TurnManager } from './application/turn_manager_compat.js';

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

export function createCombatFeatureFacade() {
  return {
    moduleCapabilities: createCombatModuleCapabilities(),
    bindings: createCombatBindingCapabilities(),
    contracts: createCombatContractCapabilities(),
    runtime: createCombatRuntimeCapabilities(),
  };
}

export const CombatPublicSurface = Object.freeze({
  CardMethods,
  CombatLifecycle,
  CombatMethods,
  createCombatFeatureFacade,
  createCombatModuleCapabilities,
  createCombatBindingCapabilities,
  createCombatContractCapabilities,
  createCombatRuntimeCapabilities,
  buildCombatFlowContractPublicBuilders,
  buildCombatRuntimeSubscriberPublicActions,
  buildCombatUiContractPublicBuilders,
  createCombatBindingsActions,
  createCombatStartRuntime,
  DamageSystem,
  DeathHandler,
  discardStateCard,
  drawStateCards,
  executePlayerDrawService,
  playStateCard,
  TurnManager,
});

export {
  buildCombatRuntimeSubscriberPublicActions,
  CardMethods,
  CombatMethods,
  createCombatStartRuntime,
  createCombatBindingsActions,
  createCombatContractCapabilities,
  createCombatRuntimeCapabilities,
  buildCombatUiContractPublicBuilders,
  DamageSystem,
  discardStateCard,
  drawStateCards,
  executePlayerDrawService,
  playStateCard,
};

export function buildCombatFlowContractPublicBuilders(ctx) {
  return buildCombatFlowContractBuilders(ctx);
}
