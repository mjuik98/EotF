import { canContinueCombatTurn, isCombatResolutionPending } from '../../../../shared/state/runtime_session_selectors.js';
import {
  dispatchCombatTurnUiAction,
  playEnemyAttackHitUi,
  playEnemyStatusTickEffects,
} from '../../../../presentation/combat/combat_turn_action_presenter.js';

export async function waitWhileCombatActive(gs, ms, options = {}) {
  const { sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay)), stepMs = 50 } = options;
  const steps = Math.ceil(ms / stepMs);
  for (let i = 0; i < steps; i += 1) {
    if (!canContinueCombatTurn(gs)) return false;
    await sleep(stepMs);
  }
  return canContinueCombatTurn(gs);
}

export function shouldAbortCombatTurn(gs) {
  return !canContinueCombatTurn(gs) || isCombatResolutionPending(gs);
}

export { dispatchCombatTurnUiAction, playEnemyAttackHitUi, playEnemyStatusTickEffects };
