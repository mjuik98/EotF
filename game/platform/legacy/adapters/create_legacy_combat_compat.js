import { createCombatPorts } from '../../../features/combat/ports/create_combat_ports.js';
import {
  applyPlayerDamage,
  drawCards as drawPlayerCards,
  executePlayerDraw as executePlayerDrawCommand,
  modifyEnergy,
} from '../game_api/player_commands.js';

export function createLegacyCombatCompat(modules) {
  const ports = createCombatPorts(modules);

  return {
    hideEnemyStatusTooltip() {
      modules.CombatUI?.hideEnemyStatusTooltip?.(ports.getCombatDeps());
    },

    showEnemyStatusTooltip(event, statusKey) {
      modules.CombatUI?.showEnemyStatusTooltip?.(event, statusKey, ports.getCombatDeps());
    },

    takeDamage(amount, gs = modules.GS) {
      return applyPlayerDamage(amount, gs);
    },

    drawCards(count, gs = modules.GS, options = {}) {
      return drawPlayerCards(count, gs, options);
    },

    executePlayerDraw(gs = modules.GS) {
      return executePlayerDrawCommand(gs, {
        modifyEnergy,
        drawCards: drawPlayerCards,
      });
    },

    updateEchoSkillBtn(overrideDeps) {
      modules.CombatHudUI?.updateEchoSkillBtn?.(overrideDeps || ports.getHudDeps());
    },
  };
}
