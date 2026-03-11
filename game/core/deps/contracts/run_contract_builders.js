import { buildRunFlowContractBuilders } from '../../../features/run/ports/contracts/build_run_flow_contracts.js';
import { buildTitleRunContractBuilders } from '../../../features/title/ports/contracts/build_title_run_contracts.js';

export function buildRunContractBuilders(ctx) {
  return {
    ...buildTitleRunContractBuilders(ctx),
    ...buildRunFlowContractBuilders(ctx),
  };
}
