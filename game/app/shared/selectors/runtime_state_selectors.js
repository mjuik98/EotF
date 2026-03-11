export function isRewardFlowLocked(gs) {
  return !!gs?._rewardLock;
}

export function isNodeMovementLocked(gs) {
  return !!gs?._nodeMoveLock;
}

export function isCombatResolutionPending(gs) {
  return !!(gs?._endCombatScheduled || gs?._endCombatRunning);
}

export function canContinueCombatTurn(gs) {
  return !!gs?.combat?.active && !isCombatResolutionPending(gs);
}

export function canShowNextNodeOverlay(gs, nextNodes = []) {
  return !!gs
    && gs.currentScreen === 'game'
    && !gs.combat?.active
    && !isNodeMovementLocked(gs)
    && !isRewardFlowLocked(gs)
    && !isCombatResolutionPending(gs)
    && nextNodes.length > 0;
}
