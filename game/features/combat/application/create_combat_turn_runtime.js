import { endPlayerTurnUseCase } from './end_player_turn_use_case.js';
import { runEnemyTurnUseCase } from './run_enemy_turn_use_case.js';
import { createCombatTurnRuntimePorts } from '../platform/combat_turn_runtime_ports.js';
import {
  createEndPlayerTurnPolicyOptions,
  createStartPlayerTurnAction,
} from './player_turn_policy_actions.js';

function buildCombatTurnRuntimePorts(runtime = {}) {
  const defaultPorts = createCombatTurnRuntimePorts();
  return {
    cleanupTurnUi: runtime.cleanupTurnUi || defaultPorts.cleanupTurnUi,
    dispatchUiAction: runtime.dispatchUiAction || defaultPorts.dispatchUiAction,
    playEnemyAttackHit: runtime.playEnemyAttackHit || defaultPorts.playEnemyAttackHit,
    playStatusTickEffects: runtime.playStatusTickEffects || defaultPorts.playStatusTickEffects,
    shouldAbortTurn: runtime.shouldAbortTurn || defaultPorts.shouldAbortTurn,
    showBossPhaseShift: runtime.showBossPhaseShift || defaultPorts.showBossPhaseShift,
    showEnemyTurnUi: runtime.showEnemyTurnUi || defaultPorts.showEnemyTurnUi,
    showPlayerTurnUi: runtime.showPlayerTurnUi || defaultPorts.showPlayerTurnUi,
    syncCombatEnergy: runtime.syncCombatEnergy || defaultPorts.syncCombatEnergy,
    waitForCombat: runtime.waitForCombat || defaultPorts.waitForCombat,
  };
}

export function endPlayerTurnRuntime(deps = {}, runtime = {}) {
  const ports = buildCombatTurnRuntimePorts(runtime);
  const endTurnPolicyOptions = runtime.endTurnPolicyOptions || createEndPlayerTurnPolicyOptions();
  return endPlayerTurnUseCase({
    gs: deps.gs,
    data: deps.data,
    canPlay: deps.cardCostUtils?.canPlay,
    classMechanics: deps.classMechanics,
    endTurnPolicyOptions,
    resetChainUi: (value) => deps.updateChainUI?.(value),
    cleanupTurnUi: () => ports.cleanupTurnUi(deps),
    showEnemyTurnUi: () => ports.showEnemyTurnUi(deps),
    runEnemyTurn: () => deps.enemyTurn?.(),
    scheduleEnemyTurn: runtime.scheduleEnemyTurn,
  });
}

export async function enemyTurnRuntime(deps = {}, runtime = {}) {
  const ports = buildCombatTurnRuntimePorts(runtime);
  const gs = deps.gs;
  const startPlayerTurn = runtime.startPlayerTurn || createStartPlayerTurnAction();

  return runEnemyTurnUseCase({
    api: deps.api,
    gs,
    data: deps.data,
    shuffleArray: deps.shuffleArray,
    classMechanics: deps.classMechanics,
    cleanupTooltips: () => ports.cleanupTurnUi(deps),
    shouldAbortTurn: ports.shouldAbortTurn,
    waitForCombat: ports.waitForCombat,
    playStatusTickEffects: (events) => ports.playStatusTickEffects(events, deps),
    renderCombatEnemies: () => deps.renderCombatEnemies?.(),
    onEnemyStunned: (enemy) => {
      gs.addLog?.(`🌀 ${enemy.name}: 기절 상태!`, 'echo');
    },
    showBossPhaseShift: (_enemy, index) => ports.showBossPhaseShift(gs, index, deps),
    playEnemyAttackHit: (index, hit, action) => ports.playEnemyAttackHit(index, hit, action, deps),
    dispatchUiAction: (result) => ports.dispatchUiAction(result, deps),
    syncCombatEnergy: () => ports.syncCombatEnergy(gs, deps),
    onTurnStart: () => deps.runRules?.onTurnStart?.(gs),
    onPlayerTurnStarted: () => ports.showPlayerTurnUi(gs, deps),
    startPlayerTurn,
  });
}

export function createCombatTurnRuntime(runtime = {}) {
  return {
    endPlayerTurn(deps = {}) {
      return endPlayerTurnRuntime(deps, runtime);
    },
    async enemyTurn(deps = {}) {
      return enemyTurnRuntime(deps, runtime);
    },
  };
}
