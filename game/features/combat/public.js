import {
  buildCombatCardPublicModules,
  buildCombatHudPublicModules,
  buildCombatPublicModules,
} from './modules/public_combat_modules.js';
import { createCombatBindingsActions } from './bindings/public_combat_bindings.js';
import { buildCombatUiContractPublicBuilders } from './contracts/public_combat_contract_builders.js';
import { buildCombatRuntimeSubscriberPublicActions } from './runtime/public_combat_runtime_actions.js';

export function createCombatModuleCapabilities() {
  return {
    core: buildCombatPublicModules(),
    cards: buildCombatCardPublicModules(),
    hud: buildCombatHudPublicModules(),
  };
}

export function createCombatBindingCapabilities() {
  return {
    createCombatBindings: createCombatBindingsActions,
  };
}

export function createCombatContractCapabilities() {
  return {
    buildUi: buildCombatUiContractPublicBuilders,
  };
}

export function createCombatRuntimeCapabilities() {
  return {
    buildSubscriberActions: buildCombatRuntimeSubscriberPublicActions,
  };
}

export {
  buildCombatPublicModules,
  buildCombatCardPublicModules,
  buildCombatHudPublicModules,
  createCombatBindingsActions,
  buildCombatRuntimeSubscriberPublicActions,
  buildCombatUiContractPublicBuilders,
};
