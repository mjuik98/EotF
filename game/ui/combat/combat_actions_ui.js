function _getDoc(deps) {
  return deps?.doc || document;
}
import { Actions } from '../../core/state_actions.js';
import { resolveDrawAvailability } from './draw_availability.js';

export const CombatActionsUI = {
  drawCard(deps = {}) {
    const gs = deps.gs;
    if (!gs) return;

    const drawState = resolveDrawAvailability(gs);
    if (drawState.canDraw) {
      gs.dispatch(Actions.PLAYER_ENERGY, { amount: -1 });
      gs.drawCards?.(1);
    }
  }
};
