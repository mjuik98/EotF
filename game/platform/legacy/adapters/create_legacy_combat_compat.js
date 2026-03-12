import {
  createCombatLegacyUiCompat,
} from '../../../features/combat/public.js';
import {
  applyPlayerDamage,
  drawCards as drawPlayerCards,
  executePlayerDraw as executePlayerDrawCommand,
  modifyEnergy,
} from '../game_api/player_commands.js';

export function createLegacyCombatCompat(modules) {
  const uiCompat = createCombatLegacyUiCompat(modules);

  return {
    hideEnemyStatusTooltip: () => uiCompat.hideEnemyStatusTooltip(),

    showEnemyStatusTooltip: (event, statusKey) => uiCompat.showEnemyStatusTooltip(event, statusKey),

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

    updateEchoSkillBtn: (overrideDeps) => uiCompat.updateEchoSkillBtn(overrideDeps),
  };
}
