export function continueRunUseCase({
  currentRegion = 0,
  getRunStartDeps,
  loadRun,
  onAfterCanvasReady,
  onBeforeResume,
  setTimeoutFn = setTimeout,
} = {}) {
  const loaded = loadRun?.();
  if (!loaded) return false;

  const runStartDeps = getRunStartDeps?.() || {};
  onBeforeResume?.(runStartDeps);

  runStartDeps.markGameStarted?.();
  runStartDeps.switchScreen?.('game');
  runStartDeps.audioEngine?.startAmbient?.(currentRegion);
  runStartDeps.updateUI?.();
  runStartDeps.updateClassSpecialUI?.();

  setTimeoutFn(() => {
    runStartDeps.initGameCanvas?.();
    if (typeof runStartDeps.requestAnimationFrame === 'function' && typeof runStartDeps.gameLoop === 'function') {
      runStartDeps.requestAnimationFrame(runStartDeps.gameLoop);
    }
    onAfterCanvasReady?.(runStartDeps);
  }, 80);

  return true;
}
