import { Actions, EventBus } from '../ports/public_state_action_capabilities.js';
import { getRegionData } from '../ports/public_run_rule_capabilities.js';
import {
  playReactionEnemyDeath,
  registerEnemyKill,
  recordEnemyWorldKill,
  replaceCombatEnemies,
  scheduleCombatEnd,
  syncSelectedTarget,
} from './death_flow_runtime_support.js';
import { applyEnemyDeathState } from './enemy_death_state.js';
import { handleEnemyDeathFlow } from './enemy_death_flow.js';
import { endCombatRuntime } from '../ports/public_application_capabilities.js';
import {
  createCombatDeathRuntimeHost,
  createEnemyDeathRuntimePort,
  spawnCombatEnemy,
} from '../integration/death_runtime_capabilities.js';

export function spawnEnemyForCombat(gs, deps = {}) {
  return spawnCombatEnemy(gs, {
    ...deps,
    getRegionData,
  });
}

export function handleCombatEnemyDeath(gs, enemy, idx, deps = {}) {
  const audioEngine = createCombatDeathRuntimeHost(deps).audioEngine;
  const { runtimePort } = createEnemyDeathRuntimePort(gs, {
    ...deps,
    endCombat: (endCombatDeps) => endCombatRuntime(gs, endCombatDeps),
    replaceCombatEnemies,
    syncSelectedTarget,
  });

  return handleEnemyDeathFlow({
    enemy,
    gs,
    idx,
    applyEnemyDeath: (state, defeatedEnemy, enemyIdx) => applyEnemyDeathState(state, defeatedEnemy, enemyIdx, {
      addGold: (amount) => gs.addGold(amount, deps),
      addLog: (message, type) => gs.addLog(message, type),
      emitEnemyDeath: (payload) => EventBus.emit(Actions.ENEMY_DEATH, payload),
      isCombatEndScheduled: () => !!gs._endCombatScheduled,
      playEnemyDeath: () => playReactionEnemyDeath(audioEngine),
      recordEnemyWorldKill: (enemyId) => recordEnemyWorldKill(gs, enemyId),
      registerEnemyKill: (enemyId) => registerEnemyKill(gs, enemyId),
      scheduleCombatEnd: () => scheduleCombatEnd(gs),
      triggerItems: (trigger, payload) => gs.triggerItems(trigger, payload),
    }),
    runtimePort,
  });
}
