import {
  createCombatLegacyUiCompat,
} from '../../../features/combat/platform/public_combat_legacy_surface.js';
import {
  applyPlayerDamage,
  drawCards as drawPlayerCards,
  executePlayerDraw as executePlayerDrawCommand,
  modifyEnergy,
} from '../game_api/player_commands.js';
import { resolveLegacyCompatValue } from '../resolve_legacy_module_bag.js';

export function createLegacyCombatCompat(modules) {
  const uiCompat = createCombatLegacyUiCompat(modules);
  const defaultGs = resolveLegacyCompatValue(modules, 'GS');

  return {
    hideEnemyStatusTooltip: () => uiCompat.hideEnemyStatusTooltip(),

    showEnemyStatusTooltip: (event, statusKey) => uiCompat.showEnemyStatusTooltip(event, statusKey),

    takeDamage(amount, gs = defaultGs) {
      return applyPlayerDamage(amount, gs);
    },

    drawCards(count, gs = defaultGs, options = {}) {
      return drawPlayerCards(count, gs, options);
    },

    executePlayerDraw(gs = defaultGs) {
      return executePlayerDrawCommand(gs, {
        modifyEnergy,
        drawCards: drawPlayerCards,
      });
    },

    updateEchoSkillBtn: (overrideDeps) => uiCompat.updateEchoSkillBtn(overrideDeps),
  };
}
