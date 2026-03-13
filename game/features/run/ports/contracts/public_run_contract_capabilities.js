import {
  buildRunFlowContractPublicBuilders,
  buildRunReturnContractPublicBuilders,
  buildRunUiContractPublicBuilders,
} from './public_run_contract_builders.js';

export function createRunContractCapabilities() {
  return {
    buildFlow: buildRunFlowContractPublicBuilders,
    buildReturn: buildRunReturnContractPublicBuilders,
    buildUi: buildRunUiContractPublicBuilders,
  };
}
