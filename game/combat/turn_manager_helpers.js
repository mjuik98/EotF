export const TURN_START_DEBUFFS = new Set(['poisoned', 'burning', 'slowed', 'confusion']);
// 적의 턴에도 소모되지 않는 버프 (공격 시에만 소모)
export const ENEMY_TURN_BUFFS = new Set(['mirror', 'spike_shield', 'immune', 'dodge', 'focus', 'focus_plus', 'vanish', 'critical_turn']);

export const TurnManagerHelpers = {
    processEnemyStun(enemy) {
        if (enemy.statusEffects?.stunned > 0) {
            enemy.statusEffects.stunned--;
            if (enemy.statusEffects.stunned <= 0) delete enemy.statusEffects.stunned;

            if (enemy.statusEffects?.weakened > 0) {
                enemy.statusEffects.weakened--;
                if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
            }
            return true;
        }
        return false;
    },

    getEnemyAction(enemy, turn) {
        try {
            return enemy.ai(turn);
        } catch {
            return { type: 'strike', intent: `공격 ${enemy.atk}`, dmg: enemy.atk };
        }
    },

    decayEnemyWeaken(enemy) {
        if (enemy.statusEffects?.weakened > 0) {
            enemy.statusEffects.weakened--;
            if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
        }
    },
};
