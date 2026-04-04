import {
  getTitleRequestAnimationFrame,
  getTitleSetTimeout,
} from '../ports/title_runtime_ports.js';

export function startTitleRunUseCase({
  getSelectedClass,
  hideTitleSubscreens,
  markPreRunRipplePlayed,
  playIntroCinematic,
  playPrelude,
  startRunSetup,
} = {}) {
  hideTitleSubscreens?.();

  const startRunFlow = () => {
    markPreRunRipplePlayed?.();
    playIntroCinematic?.(
      {
        getSelectedClass,
      },
      () => {
        startRunSetup?.();
      },
    );
  };

  playPrelude?.(startRunFlow);
}

export function continueRunUseCase({
  currentRegion = 0,
  resumeRun,
  getRunStartDeps,
  loadRun,
  onAfterCanvasReady,
  onBeforeResume,
  setTimeoutFn = null,
} = {}) {
  if (typeof resumeRun === 'function') {
    return resumeRun({
      currentRegion,
      loadRun,
      onBeforeResume,
      onAfterCanvasReady,
      setTimeoutFn,
    });
  }

  const loaded = loadRun?.();
  if (!loaded) return false;

  const runStartDeps = getRunStartDeps?.() || {};
  onBeforeResume?.(runStartDeps);

  runStartDeps.markGameStarted?.();
  runStartDeps.switchScreen?.('game');
  runStartDeps.audioEngine?.startAmbient?.(currentRegion);
  runStartDeps.updateUI?.();
  runStartDeps.updateClassSpecialUI?.();

  const scheduleResume = getTitleSetTimeout(runStartDeps, setTimeoutFn);
  const requestAnimationFrameImpl = getTitleRequestAnimationFrame(runStartDeps);

  scheduleResume(() => {
    runStartDeps.initGameCanvas?.();
    if (
      typeof requestAnimationFrameImpl === 'function'
      && typeof runStartDeps.gameLoop === 'function'
    ) {
      requestAnimationFrameImpl(runStartDeps.gameLoop);
    }
    onAfterCanvasReady?.(runStartDeps);
  }, 80);

  return true;
}
