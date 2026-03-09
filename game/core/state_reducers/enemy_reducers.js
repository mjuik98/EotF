import { Actions } from '../state_action_types.js';

export const EnemyReducers = {
  [Actions.ENEMY_DAMAGE](gs, { amount, targetIdx }) {
    const enemy = gs.combat.enemies[targetIdx];
    if (!enemy) return { actualDamage: 0 };

    let remaining = amount;
    if (!gs._ignoreShield && enemy.shield > 0) {
      const absorbed = Math.min(enemy.shield, remaining);
      enemy.shield -= absorbed;
      remaining -= absorbed;
    }
    enemy.hp = Math.max(0, enemy.hp - remaining);
    gs.stats.damageDealt += remaining;

    return {
      shieldAbsorbed: amount - remaining,
      actualDamage: remaining,
      totalDamage: amount,
      hpAfter: enemy.hp,
      isDead: enemy.hp <= 0,
      targetIdx,
    };
  },

  [Actions.ENEMY_STATUS](gs, { status, duration, targetIdx }) {
    const enemy = gs.combat.enemies[targetIdx];
    if (!enemy) return {};
    if (!enemy.statusEffects) enemy.statusEffects = {};

    if (status === 'poisoned') {
      enemy.statusEffects.poisoned = (enemy.statusEffects.poisoned || 0) + duration;
      enemy.statusEffects.poisonDuration = 3;
      return { status, duration: enemy.statusEffects.poisoned, poisonDuration: 3, targetIdx };
    }

    enemy.statusEffects[status] = (enemy.statusEffects[status] || 0) + duration;
    return { status, duration: enemy.statusEffects[status], targetIdx };
  },
};
