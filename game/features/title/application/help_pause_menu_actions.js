import { buildTitleHelpPauseActions } from './help_pause_title_actions.js';

export function createTitlePauseMenuActions({ deps = {}, ui = {} } = {}) {
  const titleActions = buildTitleHelpPauseActions(deps);

  function togglePause() {
    ui.togglePause?.(deps);
  }

  return {
    onResume: () => togglePause(),
    onOpenDeck: () => {
      deps.showDeckView?.();
      togglePause();
    },
    onOpenCodex: () => {
      deps.openCodex?.();
      togglePause();
    },
    onOpenSettings: () => {
      togglePause();
      deps.openSettings?.();
    },
    onOpenHelp: () => {
      ui.toggleHelp?.(deps);
      togglePause();
    },
    onAbandon: () => ui.abandonRun?.(deps),
    onReturnToTitle: () => ui.confirmReturnToTitle?.({
      ...deps,
      returnToTitleFromPause: titleActions.returnToTitleFromPause,
    }),
    onQuitGame: () => deps.quitGame?.(),
    onSetMasterVolume: (value) => deps.setMasterVolume?.(value),
    onSetSfxVolume: (value) => deps.setSfxVolume?.(value),
    onSetAmbientVolume: (value) => deps.setAmbientVolume?.(value),
  };
}
