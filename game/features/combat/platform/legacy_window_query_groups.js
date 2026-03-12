import { createCombatPorts } from '../ports/create_combat_ports.js';

export function createCombatLegacyUiCompat(modules) {
  const ports = createCombatPorts(modules);

  return {
    hideEnemyStatusTooltip() {
      modules.CombatUI?.hideEnemyStatusTooltip?.(ports.getCombatDeps());
    },

    showEnemyStatusTooltip(event, statusKey) {
      modules.CombatUI?.showEnemyStatusTooltip?.(event, statusKey, ports.getCombatDeps());
    },

    updateEchoSkillBtn(overrideDeps) {
      modules.CombatHudUI?.updateEchoSkillBtn?.(overrideDeps || ports.getHudDeps());
    },
  };
}

export function buildCombatLegacyWindowQueryGroups(modules) {
  const combatCompat = createCombatLegacyUiCompat(modules);

  return {
    combat: {
      showEnemyStatusTooltip: (event, statusKey) =>
        combatCompat.showEnemyStatusTooltip(event, statusKey),
      hideEnemyStatusTooltip: () => combatCompat.hideEnemyStatusTooltip(),
    },
  };
}
