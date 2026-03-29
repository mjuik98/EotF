import { buildTitleHelpPauseActions } from './help_pause_title_actions.js';

import { Logger } from '../../../utils/logger.js';

function resolveLiveDeps(deps = {}) {
  const nextDeps = typeof deps.getDeps === 'function' ? (deps.getDeps() || {}) : {};
  return {
    ...deps,
    ...nextDeps,
  };
}

function resolvePauseMenuLogger(deps = {}) {
  const logger = deps.logger || Logger;
  return typeof logger?.child === 'function'
    ? logger.child('PauseMenuActions')
    : logger;
}

function isThenable(value) {
  return !!value && typeof value.then === 'function';
}

export function createTitlePauseMenuActions({ deps = {}, ui = {} } = {}) {
  function togglePause() {
    ui.togglePause?.(resolveLiveDeps(deps));
  }

  function runPauseSurfaceAction(actionName, action) {
    const logger = resolvePauseMenuLogger(deps);
    logger.debug?.(`[PauseMenu] ${actionName} start`);

    const finalizeSuccess = () => {
      togglePause();
      logger.debug?.(`[PauseMenu] ${actionName} complete`);
    };
    const handleError = (error) => {
      logger.error?.(`[PauseMenu] ${actionName} failed`, error);
      throw error;
    };

    try {
      const result = action?.(resolveLiveDeps(deps));
      if (!isThenable(result)) {
        finalizeSuccess();
        return result;
      }
      return result.then((value) => {
        finalizeSuccess();
        return value;
      }).catch(handleError);
    } catch (error) {
      handleError(error);
      return undefined;
    }
  }

  return {
    onResume: () => togglePause(),
    onOpenDeck: () => runPauseSurfaceAction('openDeck', (resolvedDeps) => resolvedDeps.showDeckView?.()),
    onOpenCodex: () => runPauseSurfaceAction('openCodex', (resolvedDeps) => resolvedDeps.openCodex?.()),
    onOpenSettings: () => runPauseSurfaceAction('openSettings', (resolvedDeps) => resolvedDeps.openSettings?.()),
    onOpenHelp: () => runPauseSurfaceAction('openHelp', (resolvedDeps) => ui.toggleHelp?.(resolvedDeps)),
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
