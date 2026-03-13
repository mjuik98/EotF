import { endPlayerTurnPolicy } from '../../../domain/combat/turn/end_player_turn_policy.js';
import {
  decayEnemyWeaken,
  getEnemyAction,
  handleBossPhaseShift,
  handleEnemyEffect,
  processEnemyAttack,
  processEnemyStatusTicks,
  processEnemyStun,
} from '../domain/enemy_turn_domain.js';
import { processPlayerStatusTicks } from '../domain/player_status_tick_domain.js';
import {
  createEndPlayerTurnPolicyOptions,
  createStartPlayerTurnAction,
} from './player_turn_policy_actions.js';

export const TurnManager = {
  endPlayerTurnLogic(gs, data, { canPlayFn, shuffleArrayFn } = {}) {
    const endPlayerTurnPolicyOptions = createEndPlayerTurnPolicyOptions();
    return endPlayerTurnPolicy(gs, data, {
      canPlayFn,
      shuffleArrayFn,
      ...endPlayerTurnPolicyOptions,
    });
  },

  processEnemyAttack,
  processEnemyStatusTicks,
  processPlayerStatusTicks,

  handleBossPhaseShiftLogic(gs, enemy) {
    return handleBossPhaseShift(gs, enemy);
  },

  handleEnemyEffect,

  startPlayerTurnLogic(gs) {
    const startPlayerTurnAction = createStartPlayerTurnAction();
    return startPlayerTurnAction(gs);
  },

  processEnemyStun,
  getEnemyAction,
  decayEnemyWeaken,
};
