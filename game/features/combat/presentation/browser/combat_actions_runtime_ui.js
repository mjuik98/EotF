import { changePlayerEnergyState } from '../../state/card_state_commands.js';
import { resolveDrawAvailability } from './draw_availability.js';

export function performCombatDrawCard(gs, deps = {}) {
  if (!gs) return false;

  const drawState = resolveDrawAvailability(gs);
  if (!drawState.canDraw) return false;

  const executePlayerDraw = deps.executePlayerDraw || deps.api?.executePlayerDraw;
  if (typeof executePlayerDraw === 'function') {
    return executePlayerDraw(gs);
  }

  if (typeof gs.drawCards !== 'function') return false;

  changePlayerEnergyState(gs, -1);
  gs.drawCards(1);
  return true;
}
