import { Actions } from '../../shared/state/public.js';
import { resolveDrawAvailability } from './draw_availability.js';

export function performCombatDrawCard(gs) {
  if (!gs) return false;

  const drawState = resolveDrawAvailability(gs);
  if (!drawState.canDraw) return false;

  gs.dispatch(Actions.PLAYER_ENERGY, { amount: -1 });
  gs.drawCards?.(1);
  return true;
}
