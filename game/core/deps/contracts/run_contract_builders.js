import { buildRunFlowContractPublicBuilders } from '../../../features/run/public.js';
import { buildTitleRunContractPublicBuilders } from '../../../features/title/public.js';

export function buildRunContractBuilders(ctx) {
  return {
    ...buildTitleRunContractPublicBuilders(ctx),
    ...buildRunFlowContractPublicBuilders(ctx),
  };
}
