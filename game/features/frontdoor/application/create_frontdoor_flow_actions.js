import {
  continueRunUseCase,
  ensureCharacterSelectShell,
  hideTitleSubscreens,
  playPreRunRipple,
  showCharacterSelectScreen,
  showMainTitleScreen,
  startTitleRunUseCase,
} from '../../title/ports/public_frontdoor_capabilities.js';
import { createCodexBrowserModuleCapabilities } from '../../codex/ports/public_browser_modules.js';

const codexBrowserModules = createCodexBrowserModuleCapabilities();

function syncActiveSaveSlot(gs, slot) {
  if (!gs?.meta) return;
  Object.assign(gs.meta, { activeSaveSlot: Number(slot || 1) });
}

export function createFrontdoorFlowActions(context) {
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
      ensureCharacterSelectShell(doc);
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
      const slot = modules.SaveSystem?.getSelectedSlot?.()
        || saveSystemDeps.gs?.meta?.activeSaveSlot
        || 1;
      const preview = modules.SaveSystem?.readRunPreview?.({ slot });
      const { gs } = resolveTitleState({ saveSystemDeps });
      syncActiveSaveSlot(gs, slot);
      return continueRunUseCase({
        currentRegion: preview?.currentRegion ?? gs?.currentRegion ?? 0,
        getRunStartDeps: () => runStartDeps,
        loadRun: () => modules.SaveSystem?.loadRun?.({ ...saveSystemDeps, slot }),
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
      const slot = modules.SaveSystem?.getSelectedSlot?.()
        || gs?.meta?.activeSaveSlot
        || 1;
      syncActiveSaveSlot(gs, slot);
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
