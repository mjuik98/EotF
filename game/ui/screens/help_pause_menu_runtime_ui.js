import { resolveGs } from './help_pause_ui_helpers.js';

export function saveRunBeforeReturnRuntime(deps = {}) {
  const gs = resolveGs(deps);
  if (!gs) return false;

  const saveSystem = globalThis.GAME?.Modules?.SaveSystem ?? globalThis.SaveSystem;
  if (saveSystem && typeof saveSystem.saveRun === 'function') {
    saveSystem.saveRun({ gs, isGameStarted: () => true });
    return true;
  }

  if (typeof deps.saveRun === 'function') {
    deps.saveRun();
    return true;
  }

  return false;
}

export function closePauseMenuRuntime(doc, onClose) {
  doc?.getElementById?.('pauseMenu')?.remove();
  if (typeof onClose === 'function') onClose();
}

export function swallowEscapeEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === 'function') {
    event.stopImmediatePropagation();
  }
}

export function createPauseMenuRuntimeCallbacks({ deps = {}, ui }) {
  return {
    onResume: () => ui.togglePause(deps),
    onOpenDeck: () => {
      if (typeof deps.showDeckView === 'function') deps.showDeckView();
      ui.togglePause(deps);
    },
    onOpenCodex: () => {
      if (typeof deps.openCodex === 'function') deps.openCodex();
      ui.togglePause(deps);
    },
    onOpenSettings: () => {
      ui.togglePause(deps);
      if (typeof deps.openSettings === 'function') deps.openSettings();
      else globalThis.GAME?.API?.openSettings?.();
    },
    onOpenHelp: () => {
      ui.toggleHelp(deps);
      ui.togglePause(deps);
    },
    onAbandon: () => ui.abandonRun(deps),
    onReturnToTitle: () => ui.confirmReturnToTitle(deps),
    onQuitGame: () => {
      if (typeof deps.quitGame === 'function') deps.quitGame();
    },
    onSetMasterVolume: (value) => {
      if (typeof deps.setMasterVolume === 'function') deps.setMasterVolume(value);
    },
    onSetSfxVolume: (value) => {
      if (typeof deps.setSfxVolume === 'function') deps.setSfxVolume(value);
    },
    onSetAmbientVolume: (value) => {
      if (typeof deps.setAmbientVolume === 'function') deps.setAmbientVolume(value);
    },
  };
}
