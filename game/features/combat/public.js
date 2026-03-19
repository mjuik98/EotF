export { SetBonusSystem } from './domain/set_bonus_system.js';
import { CombatLifecycle } from './application/combat_lifecycle_compat.js';
import {
  applyEnemyAreaDamageRuntime,
  applyEnemyDamageRuntime,
  applyEnemyDamageState,
  createCombatApplicationCapabilities,
  createCombatStartRuntime,
  discardStateCard,
  drawStateCards,
  endCombatRuntime,
  executePlayerDrawService,
  playRuntimeCard,
  playStateCard,
} from './ports/public_application_capabilities.js';
import { createCombatBindingCapabilities } from './ports/public_binding_capabilities.js';
import { createCombatContractCapabilities } from './ports/public_contract_capabilities.js';
import { createCombatModuleCapabilities } from './ports/public_module_capabilities.js';
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
import { DamageSystem } from './application/damage_system_compat.js';
import { TurnManager } from './application/turn_manager_compat.js';

export function createCombatCompatCapabilities() {
  return {
    CardMethods,
    CombatLifecycle,
    CombatMethods,
    DamageSystem,
    DeathHandler,
    TurnManager,
  };
}

export function createCombatFeatureFacade() {
  return {
    application: createCombatApplicationCapabilities(),
    moduleCapabilities: createCombatModuleCapabilities(),
    bindings: createCombatBindingCapabilities(),
    contracts: createCombatContractCapabilities(),
    compat: createCombatCompatCapabilities(),
    runtime: createCombatRuntimeCapabilities(),
  };
}

export const CombatPublicSurface = Object.freeze({
  get application() {
    return createCombatApplicationCapabilities();
  },
  get bindings() {
    return createCombatBindingCapabilities();
  },
  get compat() {
    return createCombatCompatCapabilities();
  },
  get contracts() {
    return createCombatContractCapabilities();
  },
  createCombatBindingCapabilities,
  createCombatCompatCapabilities,
  createCombatApplicationCapabilities,
  createCombatContractCapabilities,
  createCombatFeatureFacade,
  createCombatModuleCapabilities,
  createCombatRuntimeCapabilities,
  buildCombatFlowContractPublicBuilders,
  get moduleCapabilities() {
    return createCombatModuleCapabilities();
  },
  get runtime() {
    return createCombatRuntimeCapabilities();
  },
});

export {
  buildCombatRuntimeSubscriberPublicActions,
  CardMethods,
  CombatMethods,
  createCombatApplicationCapabilities,
  createCombatStartRuntime,
  createCombatBindingsActions,
  createCombatBindingCapabilities,
  createCombatContractCapabilities,
  createCombatModuleCapabilities,
  createCombatRuntimeCapabilities,
  buildCombatUiContractPublicBuilders,
  DamageSystem,
  applyEnemyAreaDamageRuntime,
  applyEnemyDamageRuntime,
  applyEnemyDamageState,
  discardStateCard,
  drawStateCards,
  endCombatRuntime,
  executePlayerDrawService,
  playRuntimeCard,
  playStateCard,
};

export function buildCombatFlowContractPublicBuilders(ctx) {
  return buildCombatFlowContractBuilders(ctx);
}
