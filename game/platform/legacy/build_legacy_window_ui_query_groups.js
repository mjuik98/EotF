import {
  createCombatLegacyUiCompat,
} from '../../features/combat/public.js';
import { createLegacyHudRuntimeQueryBindings } from '../../features/ui/public.js';

export function buildLegacyWindowUIQueryGroups(modules, fns, deps) {
  const combatCompat = createCombatLegacyUiCompat(modules);
  const hudQueries = createLegacyHudRuntimeQueryBindings({ modules, deps, fns });

  return {
    hud: {
      updateUI: hudQueries.updateUI,
      _syncVolumeUI: hudQueries._syncVolumeUI,
      _resetCombatInfoPanel: hudQueries._resetCombatInfoPanel,
    },
    combat: {
      showEnemyStatusTooltip: (event, statusKey) =>
        combatCompat.showEnemyStatusTooltip(event, statusKey),
      hideEnemyStatusTooltip: () => combatCompat.hideEnemyStatusTooltip(),
    },
  };
}
