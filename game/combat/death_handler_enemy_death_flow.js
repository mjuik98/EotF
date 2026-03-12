export function handleEnemyDeathFlow({
  enemy,
  gs,
  idx,
  applyEnemyDeath,
  runtimePort,
} = {}) {
  if (!gs || !enemy || typeof applyEnemyDeath !== 'function' || !runtimePort) {
    return null;
  }

  const deathResult = applyEnemyDeath(gs, enemy, idx);

  runtimePort.cleanupTooltips?.();
  runtimePort.scheduleEnemyRemoval?.(idx, () => {
    runtimePort.removeDeadEnemies?.();
    runtimePort.syncSelectedTarget?.();
    runtimePort.renderCombatEnemies?.();
  });

  if (deathResult?.shouldEndCombat) {
    runtimePort.lockCombatEndInputs?.();
    runtimePort.queueCombatEnd?.();
  }

  runtimePort.updateUi?.();
  return deathResult;
}
