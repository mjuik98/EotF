import { createCombatStartRuntime } from '../application/create_combat_start_runtime.js';
import {
  applyEnemyAreaDamageRuntime,
  applyEnemyDamageRuntime,
  applyEnemyDamageState,
  discardStateCard,
  drawStateCards,
  endCombatRuntime,
  executePlayerDrawService,
  playRuntimeCard,
  playStateCard,
} from '../application/public_combat_command_actions.js';

export function createCombatApplicationCapabilities() {
  return {
    applyEnemyAreaDamageRuntime,
    applyEnemyDamageRuntime,
    applyEnemyDamageState,
    createCombatStartRuntime,
    discardStateCard,
    drawStateCards,
    endCombatRuntime,
    executePlayerDrawService,
    playRuntimeCard,
    playStateCard,
  };
}

export {
  applyEnemyAreaDamageRuntime,
  applyEnemyDamageRuntime,
  applyEnemyDamageState,
  createCombatStartRuntime,
  discardStateCard,
  drawStateCards,
  endCombatRuntime,
  executePlayerDrawService,
  playRuntimeCard,
  playStateCard,
};
