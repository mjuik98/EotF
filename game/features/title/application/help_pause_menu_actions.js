import { buildTitleHelpPauseActions } from './help_pause_title_actions.js';

function resolveLiveDeps(deps = {}) {
  const nextDeps = typeof deps.getDeps === 'function' ? (deps.getDeps() || {}) : {};
  return {
    ...deps,
    ...nextDeps,
  };
}

export function createTitlePauseMenuActions({ deps = {}, ui = {} } = {}) {
  function togglePause() {
    ui.togglePause?.(resolveLiveDeps(deps));
  }

  return {
    onResume: () => togglePause(),
    onOpenDeck: () => {
      resolveLiveDeps(deps).showDeckView?.();
      togglePause();
    },
    onOpenCodex: () => {
      resolveLiveDeps(deps).openCodex?.();
      togglePause();
    },
    onOpenSettings: () => {
      togglePause();
      resolveLiveDeps(deps).openSettings?.();
    },
    onOpenHelp: () => {
      ui.toggleHelp?.(resolveLiveDeps(deps));
      togglePause();
    },
    onAbandon: () => ui.abandonRun?.(resolveLiveDeps(deps)),
    onReturnToTitle: () => {
      const resolvedDeps = resolveLiveDeps(deps);
      const titleActions = buildTitleHelpPauseActions(resolvedDeps);
      ui.confirmReturnToTitle?.({
        ...resolvedDeps,
        returnToTitleFromPause: titleActions.returnToTitleFromPause,
      });
    },
    onQuitGame: () => resolveLiveDeps(deps).quitGame?.(),
    onSetMasterVolume: (value) => resolveLiveDeps(deps).setMasterVolume?.(value),
    onSetSfxVolume: (value) => resolveLiveDeps(deps).setSfxVolume?.(value),
    onSetAmbientVolume: (value) => resolveLiveDeps(deps).setAmbientVolume?.(value),
  };
}
