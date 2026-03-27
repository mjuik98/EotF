import { runCombatRewardTransition } from '../../../combat/ports/runtime/public_combat_runtime_surface.js';

export { runCombatRewardTransition };

export function createCombatSessionRuntimeCapabilities() {
  return Object.freeze({
    rewardTransition: runCombatRewardTransition,
  });
}
