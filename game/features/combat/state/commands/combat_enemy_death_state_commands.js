export function incrementCombatKillState(state) {
  if (!state?.player || !state?.meta) return null;
  state.player.kills = Number(state.player.kills || 0) + 1;
  state.meta.totalKills = Number(state.meta.totalKills || 0) + 1;
  return {
    kills: state.player.kills,
    totalKills: state.meta.totalKills,
  };
}

export function markCombatEnemyDefeatedState(state, enemy) {
  if (!state?.combat || !enemy) {
    return {
      bossDefeated: Boolean(state?.combat?.bossDefeated),
      miniBossDefeated: Boolean(state?.combat?.miniBossDefeated),
    };
  }
  if (enemy.isBoss) state.combat.bossDefeated = true;
  if (enemy.isMiniBoss) state.combat.miniBossDefeated = true;
  return {
    bossDefeated: Boolean(state.combat.bossDefeated),
    miniBossDefeated: Boolean(state.combat.miniBossDefeated),
  };
}
