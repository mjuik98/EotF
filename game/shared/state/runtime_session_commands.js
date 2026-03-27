function toTargetIndex(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export function beginCombatResolution(gs) {
  if (gs?._endCombatRunning) return false;
  gs._endCombatRunning = true;
  return true;
}

export function completeCombatResolution(gs) {
  gs._endCombatRunning = false;
  gs._endCombatScheduled = false;
  return { running: gs._endCombatRunning, scheduled: gs._endCombatScheduled };
}

export function scheduleCombatEnd(gs) {
  gs._endCombatScheduled = true;
  gs.combat.playerTurn = false;
  return gs._endCombatScheduled;
}

export function setCombatActive(gs, isActive) {
  gs.combat.active = !!isActive;
  return gs.combat.active;
}

export function setRewardLock(gs, isLocked) {
  gs._rewardLock = !!isLocked;
  return gs._rewardLock;
}

export function setEventLock(gs, isLocked) {
  gs._eventLock = !!isLocked;
  return gs._eventLock;
}

export function setNodeMoveLock(gs, isLocked) {
  gs._nodeMoveLock = !!isLocked;
  return gs._nodeMoveLock;
}

export function resetInteractionLocks(gs) {
  setRewardLock(gs, false);
  setNodeMoveLock(gs, false);
  setEventLock(gs, false);
  return {
    reward: gs._rewardLock,
    nodeMove: gs._nodeMoveLock,
    event: gs._eventLock,
  };
}

export function setBossRewardState(gs, { pending, lastRegion } = {}) {
  if (pending !== undefined) gs._bossRewardPending = !!pending;
  if (lastRegion !== undefined) gs._bossLastRegion = !!lastRegion;
  return { pending: !!gs._bossRewardPending, lastRegion: !!gs._bossLastRegion };
}

export function consumeBossRewardState(gs) {
  const state = {
    pending: !!gs._bossRewardPending,
    lastRegion: !!gs._bossLastRegion,
  };
  setBossRewardState(gs, { pending: false, lastRegion: false });
  return state;
}

export function replaceCombatEnemies(gs, enemies) {
  gs.combat.enemies = Array.isArray(enemies) ? enemies : [];
  return gs.combat.enemies;
}

export function syncSelectedTarget(gs) {
  const aliveCount = Array.isArray(gs?.combat?.enemies) ? gs.combat.enemies.length : 0;
  if (aliveCount === 0) {
    gs._selectedTarget = null;
  } else if (gs._selectedTarget === null || gs._selectedTarget >= aliveCount) {
    gs._selectedTarget = 0;
  } else {
    gs._selectedTarget = toTargetIndex(gs._selectedTarget);
  }
  return gs._selectedTarget;
}

export function recordEnemyWorldKill(gs, enemyId, options = {}) {
  const key = `killed_${enemyId}`;
  gs.worldMemory[key] = (gs.worldMemory[key] || 0) + 1;
  if (options?.isBoss && gs?.meta?.progress?.bossKills) {
    gs.meta.progress.bossKills[enemyId] = (gs.meta.progress.bossKills[enemyId] || 0) + 1;
  }
  return gs.worldMemory[key];
}

export function resetPlayerEchoChain(gs) {
  gs.player.echoChain = 0;
  return gs.player.echoChain;
}

export function syncGuardianPreservedShield(gs) {
  if (gs?.player?.class !== 'guardian') return gs?.player?._preservedShield;
  gs.player._preservedShield = gs.player.shield > 0 ? Math.floor(gs.player.shield / 2) : 0;
  return gs.player._preservedShield;
}
