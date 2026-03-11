import {
  completeCombatResolution,
  consumeBossRewardState,
  resetInteractionLocks,
  setCombatActive,
  setEventLock,
  setNodeMoveLock,
  setRewardLock,
} from '../../../state/commands/combat_runtime_commands.js';

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
