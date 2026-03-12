import { buildCombatUiContractPublicBuilders } from '../../../features/combat/contracts/public_combat_contract_builders.js';
import { buildRunUiContractPublicBuilders } from '../../../features/run/contracts/public_run_contract_builders.js';
import { buildUiShellContractPublicBuilders } from '../../../features/ui/public.js';

export function buildUiContractBuilders(ctx) {
  return {
    ...buildCombatUiContractPublicBuilders(ctx),
    ...buildUiShellContractPublicBuilders(ctx),
    ...buildRunUiContractPublicBuilders(ctx),
  };
}
