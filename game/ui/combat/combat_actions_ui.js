function _getDoc(deps) {
  return deps?.doc || document;
}
import { Actions } from '../../core/state_actions.js';

export const CombatActionsUI = {
  drawCard(deps = {}) {
    const gs = deps.gs;
    if (!gs) return;

    if (gs.combat?.active && gs.combat?.playerTurn) {
      const maxHand = Math.max(1, 8 - Math.max(0, Number(gs.player._handCapMinus || 0)));
      if (gs.player.energy >= 1 && gs.player.hand.length < maxHand) {
        gs.dispatch(Actions.PLAYER_ENERGY, { amount: -1 });
        gs.drawCards?.(1);
      }
    }
  }
};
