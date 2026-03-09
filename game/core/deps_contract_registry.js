import { buildCoreContractBuilders } from './deps/contracts/core_contract_builders.js';
import { buildUiContractBuilders } from './deps/contracts/ui_contract_builders.js';
import { buildRunContractBuilders } from './deps/contracts/run_contract_builders.js';

export function buildDepContractBuilders(ctx) {
  return Object.freeze({
    ...buildCoreContractBuilders(ctx),
    ...buildUiContractBuilders(ctx),
    ...buildRunContractBuilders(ctx),
  });
}
