import { createCombatStartRuntime } from '../application/create_combat_start_runtime.js';
import { beginPlayerTurnUseCase } from '../application/begin_player_turn_use_case.js';
import { drawCardsService, executePlayerDrawService } from '../application/card_draw_service.js';
import { CombatInitializer } from '../application/combat_initializer.js';
import { endPlayerTurnService } from '../application/end_turn_service.js';
import { endPlayerTurnUseCase } from '../application/end_player_turn_use_case.js';
import { playCardService } from '../application/play_card_service.js';
import {
  applyEnemyAreaDamageRuntime,
  applyEnemyDamageRuntime,
  applyEnemyDamageState,
  discardStateCard,
  drawStateCards,
  endCombatRuntime,
  playRuntimeCard,
  playStateCard,
} from '../application/public_combat_command_actions.js';
import { runEnemyTurnUseCase } from '../application/run_enemy_turn_use_case.js';
import { startCombatFlowUseCase } from '../application/start_combat_flow_use_case.js';

export function createCombatApplicationCapabilities() {
  return {
    applyEnemyAreaDamageRuntime,
    applyEnemyDamageRuntime,
    applyEnemyDamageState,
    beginPlayerTurnUseCase,
    CombatInitializer,
    createCombatStartRuntime,
    discardStateCard,
    drawCardsService,
    endPlayerTurnService,
    endPlayerTurnUseCase,
    drawStateCards,
    endCombatRuntime,
    executePlayerDrawService,
    playCardService,
    playRuntimeCard,
    playStateCard,
    runEnemyTurnUseCase,
    startCombatFlowUseCase,
  };
}

export {
  applyEnemyAreaDamageRuntime,
  applyEnemyDamageRuntime,
  applyEnemyDamageState,
  beginPlayerTurnUseCase,
  CombatInitializer,
  createCombatStartRuntime,
  discardStateCard,
  drawCardsService,
  endPlayerTurnService,
  endPlayerTurnUseCase,
  drawStateCards,
  endCombatRuntime,
  executePlayerDrawService,
  playCardService,
  playRuntimeCard,
  playStateCard,
  runEnemyTurnUseCase,
  startCombatFlowUseCase,
};
