import { createLegacyCombatCompat } from './adapters/create_legacy_combat_compat.js';

export function buildLegacyWindowUIQueryGroups(modules, fns, deps) {
  const combatCompat = createLegacyCombatCompat(modules);

  return {
    hud: {
      updateUI: () => modules.HudUpdateUI?.updateUI?.(deps.getHudUpdateDeps()),
      _syncVolumeUI: () => modules.GameInit?.syncVolumeUI?.(modules.AudioEngine),
      _resetCombatInfoPanel: fns._resetCombatInfoPanel,
    },
    combat: {
      showEnemyStatusTooltip: (event, statusKey) =>
        combatCompat.showEnemyStatusTooltip(event, statusKey),
      hideEnemyStatusTooltip: () => combatCompat.hideEnemyStatusTooltip(),
    },
  };
}
