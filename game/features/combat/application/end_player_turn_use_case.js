import { endPlayerTurnService } from './end_turn_service.js';
import { Logger } from '../ports/combat_logging.js';
import { getCombatSetTimeout as resolveCombatSetTimeout } from '../ports/public_runtime_timing_capabilities.js';

const CombatTurnLogger = Logger.child('CombatTurn');

function defaultScheduleEnemyTurn(runEnemyTurn, delayMs, scheduleFn) {
  scheduleFn(async () => {
    try {
      await runEnemyTurn?.();
    } catch (error) {
      CombatTurnLogger.error('적 턴 오류:', error);
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
  scheduleEnemyTurn,
  getCombatSetTimeout,
  setTimeoutFn,
  win,
} = {}) {
  const outcome = endPlayerTurnService({
    gs,
    data,
    canPlay,
    classMechanics,
    endTurnPolicyOptions,
  });
  if (!outcome) return null;

  const resolvedScheduleEnemyTurn = scheduleEnemyTurn
    || ((enemyTurnRunner, delayMs) => defaultScheduleEnemyTurn(
      enemyTurnRunner,
      delayMs,
      resolveCombatSetTimeout({ getCombatSetTimeout, setTimeoutFn, win }),
    ));

  if (outcome.ui.resetChain) resetChainUi?.(0);
  if (outcome.ui.cleanupTooltips) cleanupTurnUi?.();
  if (outcome.ui.setEnemyTurn) showEnemyTurnUi?.();
  resolvedScheduleEnemyTurn(runEnemyTurn, outcome.ui.enemyTurnDelayMs);

  return outcome.result;
}
