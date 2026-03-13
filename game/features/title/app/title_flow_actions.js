import {
  hideTitleSubscreens,
  showCharacterSelectScreen,
  showMainTitleScreen,
} from '../ui/title_screen_dom.js';
import { continueRunUseCase, startTitleRunUseCase } from '../application/title_run_entry_actions.js';
import { playPreRunRipple } from './title_action_helpers.js';
import { createCodexBrowserModuleCapabilities } from '../../codex/ports/public_browser_modules.js';

const codexBrowserModules = createCodexBrowserModuleCapabilities();

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
      const runStartDeps = ports.getRunStartDeps?.() || {};
      return continueRunUseCase({
        currentRegion: modules.GS?.currentRegion || 0,
        getRunStartDeps: () => runStartDeps,
        loadRun: () => modules.SaveSystem?.loadRun?.(ports.getSaveSystemDeps()),
        resumeRun: runStartDeps.continueLoadedRun,
        onBeforeResume: () => showMainTitleScreen(doc),
        onAfterCanvasReady: () => {
          fns.renderMinimap?.();
          fns.updateNextNodes?.();
        },
        setTimeoutFn: ports.setTimeoutFn,
      });
    },

    async openCodexFromTitle() {
      playClick();
      await codexBrowserModules.ensurePrimary(modules);
      modules.CodexUI?.openCodex?.({ gs: modules.GS, data: modules.DATA });
    },

    async openEndingCodex() {
      playClick();
      await codexBrowserModules.ensurePrimary(modules);
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
      const runSetupDeps = ports.getRunSetupDeps?.() || {};
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
        startRunSetup: () => {
          if (typeof runSetupDeps.startGame === 'function') {
            return runSetupDeps.startGame();
          }
          return modules.RunSetupUI?.startGame?.(runSetupDeps);
        },
      });
    },
  };
}
