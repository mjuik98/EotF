import { buildCombatUiContractBuilders } from '../../../features/combat/ports/contracts/build_combat_ui_contracts.js';
import { buildRunUiContractBuilders } from '../../../features/run/ports/contracts/build_run_ui_contracts.js';
import { buildUiShellContractBuilders } from '../../../features/ui/ports/contracts/build_ui_shell_contracts.js';

export function buildUiContractBuilders(ctx) {
  return {
    ...buildCombatUiContractBuilders(ctx),
    ...buildUiShellContractBuilders(ctx),
    ...buildRunUiContractBuilders(ctx),
  };
}
