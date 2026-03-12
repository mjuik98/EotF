export function continueLoadedRunUseCase({
  currentRegion = 0,
  markGameStarted,
  switchScreen,
  audioEngine,
  updateUI,
  updateClassSpecialUI,
  initGameCanvas,
  gameLoop,
  requestAnimationFrame,
  loadRun,
  onBeforeResume,
  onAfterCanvasReady,
  setTimeoutFn = setTimeout,
} = {}) {
  const loaded = loadRun?.();
  if (!loaded) return false;

  const runStartDeps = {
    markGameStarted,
    switchScreen,
    audioEngine,
    updateUI,
    updateClassSpecialUI,
    initGameCanvas,
    gameLoop,
    requestAnimationFrame,
  };

  onBeforeResume?.(runStartDeps);

  markGameStarted?.();
  switchScreen?.('game');
  audioEngine?.startAmbient?.(currentRegion);
  updateUI?.();
  updateClassSpecialUI?.();

  setTimeoutFn(() => {
    initGameCanvas?.();
    if (
      typeof requestAnimationFrame === 'function'
      && typeof gameLoop === 'function'
    ) {
      requestAnimationFrame(gameLoop);
    }
    onAfterCanvasReady?.(runStartDeps);
  }, 80);

  return true;
}
