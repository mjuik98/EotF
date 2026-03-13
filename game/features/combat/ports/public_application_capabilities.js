import { createCombatStartRuntime } from '../application/create_combat_start_runtime.js';
import {
  applyEnemyDamageState,
  discardStateCard,
  drawStateCards,
  executePlayerDrawService,
  playStateCard,
} from '../application/public_combat_command_actions.js';

export function createCombatApplicationCapabilities() {
  return {
    applyEnemyDamageState,
    createCombatStartRuntime,
    discardStateCard,
    drawStateCards,
    executePlayerDrawService,
    playStateCard,
  };
}

export {
  applyEnemyDamageState,
  createCombatStartRuntime,
  discardStateCard,
  drawStateCards,
  executePlayerDrawService,
  playStateCard,
};
