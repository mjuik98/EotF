import {
  hideTitleSubscreens,
  showCharacterSelectScreen,
  showMainTitleScreen,
} from '../../presentation/browser/title_screen_dom.js';
import { continueRunUseCase, startTitleRunUseCase } from '../../application/title_run_entry_actions.js';
import { playPreRunRipple } from './title_action_helpers.js';
import { createCodexBrowserModuleCapabilities } from '../../../codex/ports/public_browser_modules.js';

const codexBrowserModules = createCodexBrowserModuleCapabilities();

export function createTitleFlowActions(context) {
  const { doc, fns, modules, moduleRegistry, playClick, ports, win } = context;

  function getTitleGameBootDeps() {
    return ports.getGameBootDeps?.() || {};
  }

  function resolveTitleState(overrides = {}) {
    const gameBootDeps = overrides.gameBootDeps || getTitleGameBootDeps();
    const saveSystemDeps = overrides.saveSystemDeps || {};
    const runSetupDeps = overrides.runSetupDeps || {};
    return {
      data: runSetupDeps.data || saveSystemDeps.data || gameBootDeps.data || modules.DATA,
      gs: runSetupDeps.gs || saveSystemDeps.gs || gameBootDeps.gs || modules.GS,
    };
  }

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
      const saveSystemDeps = ports.getSaveSystemDeps?.() || {};
      const { gs } = resolveTitleState({ saveSystemDeps });
      return continueRunUseCase({
        currentRegion: gs?.currentRegion || 0,
        getRunStartDeps: () => runStartDeps,
        loadRun: () => modules.SaveSystem?.loadRun?.(saveSystemDeps),
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
      await codexBrowserModules.ensurePrimary(moduleRegistry);
      modules.CodexUI?.openCodex?.(resolveTitleState());
    },

    async openEndingCodex() {
      playClick();
      await codexBrowserModules.ensurePrimary(moduleRegistry);
      modules.CodexUI?.openCodex?.(resolveTitleState());
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
      const { gs } = resolveTitleState({ runSetupDeps });
      startTitleRunUseCase({
        getSelectedClass: () => modules.ClassSelectUI?.getSelectedClass?.(),
        hideTitleSubscreens: () => hideTitleSubscreens(doc),
        markPreRunRipplePlayed: () => {
          if (gs) gs._preRunRipplePlayed = true;
        },
        playIntroCinematic: (deps, onComplete) => ports.playIntroCinematic(
          {
            ...deps,
            gs,
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
