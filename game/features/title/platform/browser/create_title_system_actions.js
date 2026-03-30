import {
  completeTitleReturn,
  returnToTitleFromPause,
} from '../../application/title_return_actions.js';

export function createTitleSystemActions(context) {
  const { modules, playClick, ports, win } = context;

  function restartEndingFlow() {
    if (typeof modules.MetaProgressionUI?.restartEndingFlow === 'function') {
      modules.MetaProgressionUI.restartEndingFlow(ports.getMetaProgressionDeps());
      return;
    }
    modules.MetaProgressionUI?.restartFromEnding?.(ports.getMetaProgressionDeps());
  }

  return {
    toggleHelp() {
      playClick();
      modules.HelpPauseUI?.toggleHelp?.(ports.getHelpPauseDeps());
    },

    abandonRun() {
      modules.HelpPauseUI?.abandonRun?.(ports.getHelpPauseDeps());
    },

    confirmAbandon() {
      modules.HelpPauseUI?.confirmAbandon?.(ports.getHelpPauseDeps());
    },

    togglePause() {
      modules.HelpPauseUI?.togglePause?.(ports.getHelpPauseDeps());
    },

    shuffleArray(arr) {
      return modules.RandomUtils?.shuffleArray?.(arr) || arr;
    },

    restartEndingFlow,

    completeTitleReturn() {
      completeTitleReturn(ports.getMetaProgressionDeps());
    },

    returnToTitleFromPause() {
      returnToTitleFromPause({
        ...ports.getHelpPauseDeps(),
        win,
      });
    },

    restartFromEnding() {
      restartEndingFlow();
    },

    quitGame() {
      playClick();
      if (typeof modules.HelpPauseUI?.confirmQuitGame === 'function') {
        return modules.HelpPauseUI.confirmQuitGame({
          ...ports.getHelpPauseDeps(),
          win,
        });
      }
      const root = typeof globalThis !== 'undefined' ? globalThis : null;
      if (root?.confirm?.('게임을 종료하시겠습니까?')) {
        win?.close?.();
        return true;
      }
      return false;
    },
  };
}
