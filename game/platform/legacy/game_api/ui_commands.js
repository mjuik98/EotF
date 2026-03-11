import { getCombatRuntimeDeps, getModule, getUiRuntimeDeps } from './runtime_context.js';

function callUiCommand(moduleName, methodName, warningLabel, depsFactory = getUiRuntimeDeps) {
  const module = getModule(moduleName);
  if (module?.[methodName]) {
    module[methodName](depsFactory());
    return;
  }
  console.warn(`[API] ${warningLabel} not available`);
}

export function toggleHudPin() {
  callUiCommand('CombatHudUI', 'toggleHudPin', 'CombatHudUI.toggleHudPin', getCombatRuntimeDeps);
}

export function closeDeckView() {
  callUiCommand('DeckModalUI', 'closeDeckView', 'DeckModalUI.closeDeckView');
}

export function closeCodex() {
  callUiCommand('CodexUI', 'closeCodex', 'CodexUI.closeCodex');
}
