import {
  hideTitleSubscreens,
  showCharacterSelectScreen,
  showMainTitleScreen,
} from '../ui/title_screen_dom.js';
import { continueRunUseCase } from '../../../app/title/use_cases/continue_run_use_case.js';
import { startTitleRunUseCase } from '../../../app/title/use_cases/start_title_run_use_case.js';
import { playPreRunRipple } from './title_action_helpers.js';

export function createTitleFlowActions(context) {
  const { doc, fns, modules, playClick, ports, win } = context;

  return {
    showCharacterSelect() {
      playClick();
      showCharacterSelectScreen(doc);
      modules.CharacterSelectUI?.onEnter?.();
    },

    backToTitle() {
      playClick();
      showMainTitleScreen(doc);
    },

    continueRun() {
      playClick();
      return continueRunUseCase({
        currentRegion: modules.GS?.currentRegion || 0,
        getRunStartDeps: () => ports.getRunStartDeps(),
        loadRun: () => modules.SaveSystem?.loadRun?.(ports.getSaveSystemDeps()),
        onBeforeResume: () => showMainTitleScreen(doc),
        onAfterCanvasReady: () => {
          fns.renderMinimap?.();
          fns.updateNextNodes?.();
        },
        setTimeoutFn: ports.setTimeoutFn,
      });
    },

    openCodexFromTitle() {
      playClick();
      modules.CodexUI?.openCodex?.({ gs: modules.GS, data: modules.DATA });
    },

    selectClass(target) {
      playClick();
      const classSelectDeps = ports.getClassSelectDeps();
      if (typeof target === 'string' || typeof target === 'number') {
        modules.ClassSelectUI?.selectClassById?.(target, classSelectDeps);
        return;
      }
      modules.ClassSelectUI?.selectClass?.(target, classSelectDeps);
    },

    startGame() {
      playClick();
      startTitleRunUseCase({
        getSelectedClass: () => modules.ClassSelectUI?.getSelectedClass?.(),
        hideTitleSubscreens: () => hideTitleSubscreens(doc),
        markPreRunRipplePlayed: () => {
          if (modules.GS) modules.GS._preRunRipplePlayed = true;
        },
        playIntroCinematic: (deps, onComplete) => ports.playIntroCinematic(
          {
            ...deps,
            gs: modules.GS,
          },
          onComplete,
        ),
        playPrelude: (onComplete) => playPreRunRipple({ doc, startPreRunRipple: ports.startPreRunRipple, win }, onComplete),
        startRunSetup: () => modules.RunSetupUI?.startGame?.(ports.getRunSetupDeps()),
      });
    },
  };
}
