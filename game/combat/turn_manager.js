/**
 * turn_manager.js — legacy combat facade kept for compatibility.
 */
import { ENEMY_TURN_BUFFS, TURN_START_DEBUFFS } from './turn_manager_helpers.js';
import { endPlayerTurnPolicy } from '../domain/combat/turn/end_player_turn_policy.js';
import { startPlayerTurnPolicy } from '../domain/combat/turn/start_player_turn_policy.js';
import {
    decayEnemyWeaken,
    getEnemyAction,
    handleBossPhaseShift,
    handleEnemyEffect,
    processEnemyAttack,
    processEnemyStatusTicks,
    processEnemyStun,
} from '../features/combat/domain/enemy_turn_domain.js';
import { processPlayerStatusTicks } from '../features/combat/domain/player_status_tick_domain.js';

export const TurnManager = {
    endPlayerTurnLogic(gs, data, { canPlayFn, shuffleArrayFn } = {}) {
        return endPlayerTurnPolicy(gs, data, { canPlayFn, shuffleArrayFn });
    },

    processEnemyAttack,
    processEnemyStatusTicks,
    processPlayerStatusTicks,

    handleBossPhaseShiftLogic(gs, enemy) {
        return handleBossPhaseShift(gs, enemy);
    },

    handleEnemyEffect,

    startPlayerTurnLogic(gs) {
        return startPlayerTurnPolicy(gs);
    },

    processEnemyStun,
    getEnemyAction,
    decayEnemyWeaken,
};
