import { createPublicLegacyUiCommands } from '../../../features/ui/platform/public_ui_command_surface.js';
import { getCombatRuntimeDeps, getModule, getUiRuntimeDeps } from './runtime_context.js';

function getLegacyUiCommands() {
  return createPublicLegacyUiCommands({
    getModule,
    getUiRuntimeDeps,
    getCombatRuntimeDeps,
  });
}

export function toggleHudPin() {
  return getLegacyUiCommands().toggleHudPin();
}

export function closeDeckView() {
  return getLegacyUiCommands().closeDeckView();
}

export function closeCodex() {
  return getLegacyUiCommands().closeCodex();
}
