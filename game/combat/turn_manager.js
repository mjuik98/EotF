/**
 * turn_manager.js — legacy combat facade kept for compatibility.
 */
import { ENEMY_TURN_BUFFS, TURN_START_DEBUFFS } from '../domain/combat/turn/turn_manager_helpers.js';
import { endPlayerTurnPolicy } from '../domain/combat/turn/end_player_turn_policy.js';
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
import {
    createEndPlayerTurnPolicyOptions,
    createStartPlayerTurnAction,
} from '../features/combat/application/player_turn_policy_actions.js';

const startPlayerTurnAction = createStartPlayerTurnAction();
const endPlayerTurnPolicyOptions = createEndPlayerTurnPolicyOptions();

export const TurnManager = {
    endPlayerTurnLogic(gs, data, { canPlayFn, shuffleArrayFn } = {}) {
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
        return startPlayerTurnAction(gs);
    },

    processEnemyStun,
    getEnemyAction,
    decayEnemyWeaken,
};
