export function buildCombatTurnActionGroup(ctx) {
  const { modules, ports } = ctx;

  return {
    startCombat(isBoss = false) {
      modules.CombatStartUI?.startCombat?.(isBoss, ctx.createStartCombatDeps());
    },

    endPlayerTurn() {
      modules.CombatTurnUI?.endPlayerTurn?.(ports.getCombatTurnBaseDeps());
    },

    enemyTurn() {
      modules.CombatTurnUI?.enemyTurn?.(ports.getCombatTurnBaseDeps());
    },

    processEnemyStatusTicks() {
      modules.CombatTurnUI?.processEnemyStatusTicks?.(ports.getCombatTurnBaseDeps());
    },

    handleBossPhaseShift(enemy, idx) {
      modules.CombatTurnUI?.handleBossPhaseShift?.(enemy, idx, ports.getCombatTurnBaseDeps());
    },

    handleEnemyEffect(effect, enemy, idx) {
      modules.CombatTurnUI?.handleEnemyEffect?.(effect, enemy, idx, ports.getCombatTurnBaseDeps());
    },
  };
}
