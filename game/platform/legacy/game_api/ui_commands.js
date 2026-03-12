import { createLegacyUiCommandFacade } from '../../../features/ui/public.js';
import { getCombatRuntimeDeps, getModule, getUiRuntimeDeps } from './runtime_context.js';

function getLegacyUiCommands() {
  return createLegacyUiCommandFacade({
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
