import { buildRunFlowContractBuilders } from './build_run_flow_contracts.js';
import { buildRunReturnContractBuilders } from './build_run_return_contracts.js';
import { buildRunUiContractBuilders } from './build_run_ui_contracts.js';

export function buildRunUiContractPublicBuilders(ctx) {
  return buildRunUiContractBuilders(ctx);
}

export function buildRunFlowContractPublicBuilders(ctx) {
  return buildRunFlowContractBuilders(ctx);
}

export function buildRunReturnContractPublicBuilders(ctx) {
  return buildRunReturnContractBuilders(ctx);
}
