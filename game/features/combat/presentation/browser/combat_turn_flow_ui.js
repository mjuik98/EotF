import {
  canContinueCombatTurn,
  isCombatResolutionPending,
} from '../../ports/presentation_shared_runtime_capabilities.js';
import {
  dispatchCombatTurnUiAction,
  playEnemyAttackHitUi,
  playEnemyStatusTickEffects,
} from './combat_turn_action_presenter.js';

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
