import {
  completeCombatResolution,
  consumeBossRewardState,
  resetInteractionLocks,
  setCombatActive,
  setEventLock,
  setNodeMoveLock,
  setRewardLock,
} from '../../state/commands/combat_runtime_commands.js';

/**
 * Shared runtime flow controls for combat, reward, event, and map traversal.
 * Keep the lock/activation surface stable while feature code moves away from app-local aliases.
 */
export function deactivateCombat(gs) {
  return setCombatActive(gs, false);
}

export function activateCombat(gs) {
  return setCombatActive(gs, true);
}

export function unlockRewardFlow(gs) {
  return setRewardLock(gs, false);
}

export function lockRewardFlow(gs) {
  return setRewardLock(gs, true);
}

export function unlockEventFlow(gs) {
  return setEventLock(gs, false);
}

export function setNodeMovementLocked(gs, isLocked) {
  return setNodeMoveLock(gs, isLocked);
}

export function resetRuntimeInteractionState(gs) {
  resetInteractionLocks(gs);
  completeCombatResolution(gs);
  return gs;
}

export function consumeBossRewardFlags(gs) {
  return consumeBossRewardState(gs);
}
