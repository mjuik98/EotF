import { buildCombatFlowContractBuilders } from './build_combat_flow_contracts.js';
import { buildCombatUiContractPublicBuilders } from './public_combat_contract_builders.js';

export function createCombatContractCapabilities() {
  return {
    buildFlow: buildCombatFlowContractBuilders,
    buildUi: buildCombatUiContractPublicBuilders,
  };
}
