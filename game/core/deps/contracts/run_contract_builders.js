import { buildRunFlowContractPublicBuilders } from '../../../features/run/contracts/public_run_contract_builders.js';
import { buildTitleRunContractPublicBuilders } from '../../../features/title/public.js';

export function buildRunContractBuilders(ctx) {
  return {
    ...buildTitleRunContractPublicBuilders(ctx),
    ...buildRunFlowContractPublicBuilders(ctx),
  };
}
