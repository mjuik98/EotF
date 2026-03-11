import {
  addGold,
  addShield,
  applyPlayerDamage,
  drawCards,
  executePlayerDraw,
  healPlayer,
  modifyEnergy,
} from './game_api/player_commands.js';

export function buildLegacyGameAPIPlayerFacade(apiRef) {
  return {
    applyPlayerDamage,
    addShield,
    healPlayer,
    addGold,
    modifyEnergy,
    drawCards,
    executePlayerDraw(gs) {
      return executePlayerDraw(gs, apiRef);
    },
  };
}
