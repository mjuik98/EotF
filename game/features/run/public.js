import {
  buildRunFlowPublicModules,
  buildRunMapPublicModules,
} from './modules/public_run_modules.js';
import { createRunCanvasBindings } from './bindings/public_run_bindings.js';
import {
  buildRunFlowContractPublicBuilders,
  buildRunReturnContractPublicBuilders,
  buildRunUiContractPublicBuilders,
} from './contracts/public_run_contract_builders.js';
import {
  buildRunBootPublicActions,
  buildRunReturnRuntimePublicActions,
} from './runtime/public_run_runtime_actions.js';

export function createRunModuleCapabilities() {
  return {
    map: buildRunMapPublicModules(),
    flow: buildRunFlowPublicModules(),
  };
}

export function createRunBindingCapabilities() {
  return {
    createCanvas: createRunCanvasBindings,
  };
}

export function createRunContractCapabilities() {
  return {
    buildFlow: buildRunFlowContractPublicBuilders,
    buildReturn: buildRunReturnContractPublicBuilders,
    buildUi: buildRunUiContractPublicBuilders,
  };
}

export function createRunRuntimeCapabilities() {
  return {
    buildBootActions: buildRunBootPublicActions,
    buildReturnActions: buildRunReturnRuntimePublicActions,
  };
}

export {
  buildRunMapPublicModules,
  buildRunFlowPublicModules,
  createRunCanvasBindings,
  buildRunBootPublicActions,
  buildRunUiContractPublicBuilders,
  buildRunFlowContractPublicBuilders,
  buildRunReturnContractPublicBuilders,
  buildRunReturnRuntimePublicActions,
};
