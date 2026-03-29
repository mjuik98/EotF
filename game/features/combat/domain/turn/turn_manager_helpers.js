import {
  ENEMY_TURN_BUFF_KEYS,
  TURN_START_DEBUFF_KEYS,
} from '../../../../../data/status_key_data.js';
import { getResolvedEnemyAction } from '../enemy_intent_domain.js';

export const TURN_START_DEBUFFS = new Set(TURN_START_DEBUFF_KEYS);
export const ENEMY_TURN_BUFFS = new Set(ENEMY_TURN_BUFF_KEYS);

export const TurnManagerHelpers = {
  processEnemyStun(enemy) {
    if (enemy.statusEffects?.stunned > 0) {
      enemy.statusEffects.stunned -= 1;
      if (enemy.statusEffects.stunned <= 0) delete enemy.statusEffects.stunned;

      if (enemy.statusEffects?.weakened > 0) {
        enemy.statusEffects.weakened -= 1;
        if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
      }
      return true;
    }
    return false;
  },

  getEnemyAction(enemy, turn, gs = null) {
    return getResolvedEnemyAction(gs, enemy, turn);
  },

  decayEnemyWeaken(enemy) {
    if (enemy.statusEffects?.weakened > 0) {
      enemy.statusEffects.weakened -= 1;
      if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
    }
  },
};
