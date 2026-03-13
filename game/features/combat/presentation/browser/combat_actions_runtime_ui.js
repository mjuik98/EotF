import { changePlayerEnergyState } from '../../state/card_state_commands.js';
import { resolveDrawAvailability } from './draw_availability.js';

export function performCombatDrawCard(gs) {
  if (!gs) return false;

  const drawState = resolveDrawAvailability(gs);
  if (!drawState.canDraw) return false;

  changePlayerEnergyState(gs, -1);
  gs.drawCards?.(1);
  return true;
}
