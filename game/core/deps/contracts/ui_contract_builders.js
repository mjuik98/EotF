import { buildCombatUiContractPublicBuilders } from '../../../features/combat/public.js';
import { buildRunUiContractPublicBuilders } from '../../../features/run/public.js';
import { buildUiShellContractPublicBuilders } from '../../../features/ui/public.js';

export function buildUiContractBuilders(ctx) {
  return {
    ...buildCombatUiContractPublicBuilders(ctx),
    ...buildUiShellContractPublicBuilders(ctx),
    ...buildRunUiContractPublicBuilders(ctx),
  };
}
