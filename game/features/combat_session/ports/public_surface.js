import {
  cycleNextCombatTarget,
  handleCombatInputAction,
} from './public_application_capabilities.js';
import {
  createCombatSessionRuntimeCapabilities,
} from './runtime/public_combat_session_runtime_surface.js';

export function createCombatSessionApplicationCapabilities() {
  return Object.freeze({
    cycleTarget: cycleNextCombatTarget,
    handleInputAction: handleCombatInputAction,
  });
}

export const CombatSessionPublicSurface = Object.freeze({
  application: createCombatSessionApplicationCapabilities(),
  runtime: createCombatSessionRuntimeCapabilities(),
});
