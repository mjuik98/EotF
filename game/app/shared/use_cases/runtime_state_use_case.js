// Compatibility re-export while callers move to the shared runtime flow surface.
export {
  activateCombat,
  consumeBossRewardFlags,
  deactivateCombat,
  lockRewardFlow,
  resetRuntimeInteractionState,
  setNodeMovementLocked,
  unlockEventFlow,
  unlockRewardFlow,
} from '../../../shared/state/runtime_flow_controls.js';
