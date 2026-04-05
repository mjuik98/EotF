import {
  continueRunUseCase,
  ensureCharacterSelectShell,
  hideTitleSubscreens,
  playPreRunRipple,
  showCharacterSelectScreen,
  showMainTitleScreen,
  startTitleRunUseCase,
} from '../ports/frontdoor_title_flow_ports.js';
import { createFrontdoorRuntimePorts } from './frontdoor_runtime_ports.js';
import { createFrontdoorCodexRuntimePorts } from '../ports/create_frontdoor_codex_runtime_ports.js';

function syncActiveSaveSlot(gs, slot) {
  if (!gs?.meta) return;
  Object.assign(gs.meta, { activeSaveSlot: Number(slot || 1) });
}

export function createFrontdoorFlowActions(context) {
  const { doc, fns, modules, moduleRegistry, playClick, ports, win } = context;
  const runtimePorts = createFrontdoorRuntimePorts(context);
  const codexRuntimePorts = createFrontdoorCodexRuntimePorts({ moduleRegistry });

  return {
    showCharacterSelect() {
      playClick();
      ensureCharacterSelectShell(doc);
      showCharacterSelectScreen(doc);
      runtimePorts.onCharacterSelectEnter();
    },

    backToTitle() {
      playClick();
      showMainTitleScreen(doc);
    },

    continueRun() {
      playClick();
      const runStartDeps = ports.getRunStartDeps?.() || {};
      const saveSystemDeps = ports.getSaveSystemDeps?.() || {};
      const { gs } = runtimePorts.resolveTitleState({ saveSystemDeps });
      const slot = runtimePorts.getSelectedSlot({ gs, saveSystemDeps });
      const preview = runtimePorts.readRunPreview(slot);
      syncActiveSaveSlot(gs, slot);
      return continueRunUseCase({
        currentRegion: preview?.currentRegion ?? gs?.currentRegion ?? 0,
        getRunStartDeps: () => runStartDeps,
        loadRun: () => runtimePorts.loadRun(slot, saveSystemDeps),
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
      await codexRuntimePorts.openCodex(
        runtimePorts.resolveTitleState(),
        (state) => runtimePorts.openCodex(state),
      );
    },

    async openEndingCodex() {
      playClick();
      await codexRuntimePorts.openCodex(
        runtimePorts.resolveTitleState(),
        (state) => runtimePorts.openCodex(state),
      );
    },

    selectClass(target) {
      playClick();
      const classSelectDeps = ports.getClassSelectDeps();
      runtimePorts.selectClass(target, classSelectDeps);
    },

    startGame() {
      playClick();
      const runSetupDeps = ports.getRunSetupDeps?.() || {};
      const { gs } = runtimePorts.resolveTitleState({ runSetupDeps });
      const slot = runtimePorts.getSelectedSlot({ gs });
      syncActiveSaveSlot(gs, slot);
      startTitleRunUseCase({
        getSelectedClass: () => runtimePorts.getSelectedClass(),
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
        startRunSetup: () => runtimePorts.startRunSetup(runSetupDeps),
      });
    },
  };
}
