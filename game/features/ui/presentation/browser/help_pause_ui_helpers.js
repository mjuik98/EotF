export {
  eventMatchesCode,
  getKeybindingCode,
  keyCodeToLabel,
} from './help_pause_keybinding_helpers.js';
export {
  getDoc,
  isCombatOverlayActive,
  isDeckViewVisible,
  isFullMapOverlayVisible,
  isHelpMenuVisible,
  isInGame,
  isNodeCardOverlayVisible,
  isPauseMenuVisible,
  isRunCutsceneVisible,
  isVisibleModal,
} from './help_pause_visibility.js';
export {
  RUN_HOTKEY_MODE_POLICY,
  canOpenFullMap,
  canToggleDeckView,
  getRunHotkeyPolicy,
  getRunHotkeyState,
  hasBlockingGameplayModal,
} from './help_pause_run_hotkey_state.js';

export function resolveGs(deps = {}) {
  return deps?.gs
    || deps?.State
    || deps?.state
    || null;
}

export function clearActiveRunSave(deps = {}) {
  if (typeof deps.clearActiveRunSave === 'function') {
    deps.clearActiveRunSave();
    return;
  }

  const saveSystem = deps.saveSystem || deps.SaveSystem || null;
  saveSystem?.clearSave?.();
}
