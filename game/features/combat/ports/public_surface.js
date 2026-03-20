export { SetBonusSystem } from '../domain/set_bonus_system.js';
import {
  createCombatApplicationCapabilities,
} from './public_application_capabilities.js';
import { createCombatBindingCapabilities } from './public_binding_capabilities.js';
import { createCombatCompatCapabilities } from './public_compat_capabilities.js';
import { createCombatContractCapabilities } from './public_contract_capabilities.js';
import { createCombatModuleCapabilities } from './public_module_capabilities.js';
import { createCombatStateCapabilities } from './public_state_capabilities.js';
import { buildCombatFlowContractBuilders } from './contracts/build_combat_flow_contracts.js';
import { createCombatRuntimeCapabilities } from './public_runtime_capabilities.js';

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
  get moduleCapabilities() {
    return createCombatModuleCapabilities();
  },
  get runtime() {
    return createCombatRuntimeCapabilities();
  },
});

export {
  createCombatApplicationCapabilities,
  createCombatBindingCapabilities,
  createCombatCompatCapabilities,
  createCombatContractCapabilities,
  createCombatModuleCapabilities,
  createCombatRuntimeCapabilities,
};

export function buildCombatFlowContractPublicBuilders(ctx) {
  return buildCombatFlowContractBuilders(ctx);
}
