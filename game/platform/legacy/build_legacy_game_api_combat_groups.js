import { createLegacyCombatCompat } from './adapters/create_legacy_combat_compat.js';

export function buildLegacyGameAPICombatGroups(modules, fns) {
  const combatCompat = createLegacyCombatCompat(modules);

  return {
    hud: {
      updateCombatLog: fns.updateCombatLog,
      updateEchoSkillBtn: (overrideDeps) => combatCompat.updateEchoSkillBtn(overrideDeps),
      toggleHudPin: fns.toggleHudPin,
      toggleBattleChronicle: fns.toggleBattleChronicle,
      openBattleChronicle: fns.openBattleChronicle,
      closeBattleChronicle: fns.closeBattleChronicle,
      showEchoSkillTooltip: fns.showEchoSkillTooltip,
      hideEchoSkillTooltip: fns.hideEchoSkillTooltip,
    },
    player: {
      takeDamage: (amt) => combatCompat.takeDamage(amt),
      drawCards: (count, gs, options) => combatCompat.drawCards(count, gs, options),
      executePlayerDraw: (gs) => combatCompat.executePlayerDraw(gs),
      drawCard: fns.drawCard,
    },
    flow: {
      endPlayerTurn: fns.endPlayerTurn,
      renderCombatCards: fns.renderCombatCards,
      useEchoSkill: fns.useEchoSkill,
    },
  };
}
