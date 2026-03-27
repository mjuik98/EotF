import {
  incrementCombatKillState,
  markCombatEnemyDefeatedState,
} from '../state/commands/combat_enemy_death_state_commands.js';

export function applyEnemyDeathState(gs, enemy, idx, deps = {}) {
  incrementCombatKillState(gs);

  deps.emitEnemyDeath?.({
    enemy: { name: enemy.name, id: enemy.id },
    idx,
  });

  markCombatEnemyDefeatedState(gs, enemy);

  const goldGained = enemy.gold || 10;
  deps.addGold?.(goldGained);
  deps.playEnemyDeath?.();
  deps.addLog?.(`💀 ${enemy.name} 처치! +${goldGained}골드`, 'system');
  deps.triggerItems?.('enemy_kill', { enemy, idx, gold: goldGained });

  if (gs.meta.codex && enemy.id) {
    deps.registerEnemyKill?.(enemy.id);
  }
  deps.recordEnemyWorldKill?.(enemy.id, {
    isBoss: !!enemy?.isBoss,
  });

  const aliveEnemies = gs.combat.enemies.filter((combatEnemy) => combatEnemy.hp > 0);
  const shouldEndCombat = aliveEnemies.length === 0 && !deps.isCombatEndScheduled?.();

  if (shouldEndCombat) {
    deps.scheduleCombatEnd?.();
  }

  return {
    aliveEnemies,
    goldGained,
    shouldEndCombat,
  };
}
