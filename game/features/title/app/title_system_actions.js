import {
  completeTitleReturn,
  returnToTitleFromPause,
} from './title_return_actions.js';

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
      const root = typeof globalThis !== 'undefined' ? globalThis : null;
      playClick();
      if (root?.confirm?.('정말로 게임을 종료하시겠습니까?')) {
        win?.close?.();
        setTimeout(() => root?.alert?.('브라우저 정책상 닫기 API가 작동하지 않을 수 있습니다. 창을 직접 닫아주세요.'), 500);
      }
    },
  };
}
