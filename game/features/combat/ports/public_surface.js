export { SetBonusSystem } from '../domain/set_bonus_system.js';
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
import {
  CardMethods,
  CombatMethods,
  DamageSystem,
  TurnManager,
  DeathHandler,
  createCombatCompatCapabilities,
  CombatLifecycle,
} from './public_compat_capabilities.js';
import { createCombatContractCapabilities } from './public_contract_capabilities.js';
import { createCombatModuleCapabilities } from './public_module_capabilities.js';
import { createCombatStateCapabilities } from './public_state_capabilities.js';
import { buildCombatFlowContractBuilders } from './contracts/build_combat_flow_contracts.js';
import { buildCombatUiContractPublicBuilders } from './contracts/public_combat_contract_builders.js';
import {
  buildCombatRuntimeSubscriberPublicActions,
  createCombatBindingsActions,
  createCombatRuntimeCapabilities,
} from './public_runtime_capabilities.js';

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
  get state() {
    return createCombatStateCapabilities();
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
  createCombatCompatCapabilities,
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
