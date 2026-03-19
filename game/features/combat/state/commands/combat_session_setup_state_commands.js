export function applyCombatSessionSetupReducerState(state) {
  const combat = state?.combat;
  if (!combat) return null;

  combat.enemies = [];
  combat.turn = 1;
  combat.playerTurn = true;
  combat.log = [];
  combat.bossDefeated = false;
  combat.miniBossDefeated = false;

  state._endCombatScheduled = false;
  state._endCombatRunning = false;
  state._selectedTarget = null;
  state._combatStartDmg = state.stats?.damageDealt;
  state._combatStartTaken = state.stats?.damageTaken;
  state._combatStartKills = state.player?.kills;

  return {
    selectedTarget: state._selectedTarget,
    turn: combat.turn,
  };
}

export function applyCombatEnemyAddReducerState(state, enemy) {
  if (!state?.combat || !enemy) return null;
  state.combat.enemies.push(enemy);
  return enemy;
}

export function applyCombatSelectedTargetSyncReducerState(state) {
  const firstAlive = state?.combat?.enemies?.findIndex((enemy) => enemy.hp > 0) ?? -1;
  state._selectedTarget = firstAlive >= 0 ? firstAlive : null;
  return state._selectedTarget;
}
