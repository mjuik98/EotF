function _getDoc(deps) {
  return deps?.doc || document;
}
import { Actions } from '../../core/state_actions.js';

export const CombatActionsUI = {
  drawCard(deps = {}) {
    const gs = deps.gs;
    if (!gs) return;

    if (gs.combat?.active && gs.combat?.playerTurn) {
      if (gs.player.energy >= 1 && gs.player.hand.length < 8) {
        gs.dispatch(Actions.PLAYER_ENERGY, { amount: -1 });
        gs.drawCards?.(1);
      }
    }
  }
};
