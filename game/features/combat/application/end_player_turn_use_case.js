import { endPlayerTurnService } from './end_turn_service.js';

function defaultScheduleEnemyTurn(runEnemyTurn, delayMs) {
  setTimeout(async () => {
    try {
      await runEnemyTurn?.();
    } catch (error) {
      console.error('[CombatTurn] 적 턴 오류:', error);
    }
  }, delayMs);
}

export function endPlayerTurnUseCase({
  gs,
  data,
  canPlay,
  classMechanics,
  endTurnPolicyOptions,
  resetChainUi,
  cleanupTurnUi,
  showEnemyTurnUi,
  runEnemyTurn,
  scheduleEnemyTurn = defaultScheduleEnemyTurn,
} = {}) {
  const outcome = endPlayerTurnService({
    gs,
    data,
    canPlay,
    classMechanics,
    endTurnPolicyOptions,
  });
  if (!outcome) return null;

  if (outcome.ui.resetChain) resetChainUi?.(0);
  if (outcome.ui.cleanupTooltips) cleanupTurnUi?.();
  if (outcome.ui.setEnemyTurn) showEnemyTurnUi?.();
  scheduleEnemyTurn(runEnemyTurn, outcome.ui.enemyTurnDelayMs);

  return outcome.result;
}
