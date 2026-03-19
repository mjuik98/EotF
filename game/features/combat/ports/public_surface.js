export { SetBonusSystem } from '../domain/set_bonus_system.js';
import { CombatLifecycle } from '../compat/combat_lifecycle.js';
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
} from './public_application_capabilities.js';
import { createCombatBindingCapabilities } from './public_binding_capabilities.js';
import { createCombatContractCapabilities } from './public_contract_capabilities.js';
import { createCombatModuleCapabilities } from './public_module_capabilities.js';
import { DeathHandler } from '../compat/death_handler.js';
import { buildCombatFlowContractBuilders } from './contracts/build_combat_flow_contracts.js';
import { buildCombatUiContractPublicBuilders } from './contracts/public_combat_contract_builders.js';
import {
  buildCombatRuntimeSubscriberPublicActions,
  createCombatBindingsActions,
  createCombatRuntimeCapabilities,
} from './public_runtime_capabilities.js';
import { CardMethods } from '../compat/card_methods.js';
import { CombatMethods } from '../compat/combat_methods.js';
import { DamageSystem } from '../compat/damage_system.js';
import { TurnManager } from '../compat/turn_manager.js';

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
