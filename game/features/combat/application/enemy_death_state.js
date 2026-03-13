export function applyEnemyDeathState(gs, enemy, idx, deps = {}) {
  gs.player.kills += 1;
  gs.meta.totalKills += 1;

  deps.emitEnemyDeath?.({
    enemy: { name: enemy.name, id: enemy.id },
    idx,
  });

  if (enemy.isBoss) {
    gs.combat.bossDefeated = true;
  }
  if (enemy.isMiniBoss) {
    gs.combat.miniBossDefeated = true;
  }

  const goldGained = enemy.gold || 10;
  deps.addGold?.(goldGained);
  deps.playEnemyDeath?.();
  deps.addLog?.(`💀 ${enemy.name} 처치! +${goldGained}골드`, 'system');
  deps.triggerItems?.('enemy_kill', { enemy, idx, gold: goldGained });

  if (gs.meta.codex && enemy.id) {
    deps.registerEnemyKill?.(enemy.id);
  }
  deps.recordEnemyWorldKill?.(enemy.id);

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
