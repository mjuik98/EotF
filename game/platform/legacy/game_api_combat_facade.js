import {
  applyEnemyDamage,
  discardCard,
  endCombat,
  playCard,
} from './game_api/combat_commands.js';

export function buildLegacyGameAPICombatFacade(apiRef) {
  return {
    applyEnemyDamage,
    discardCard,
    playCard(cardId, handIdx, gs) {
      return playCard(cardId, handIdx, gs, apiRef);
    },
    endCombat,
  };
}
