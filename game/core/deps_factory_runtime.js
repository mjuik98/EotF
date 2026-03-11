export function createDepsFactoryRuntime() {
  let refs = {};

  function getHostObject() {
    try {
      return Function('return this')();
    } catch {
      return null;
    }
  }

  function getHostWindow() {
    const gameDeps = refs.GAME?.getDeps?.() || {};
    const host = getHostObject();
    return gameDeps.win || gameDeps.doc?.defaultView || host?.window || host || null;
  }

  function initRefs(nextRefs) {
    refs = nextRefs || {};
  }

  function patchRefs(partial) {
    Object.assign(refs, partial || {});
  }

  function getRefs() {
    return refs;
  }

  function getGameDeps() {
    return refs.GAME?.getDeps?.() || {};
  }

  function getRaf() {
    const hostWin = getHostWindow();
    if (typeof hostWin?.requestAnimationFrame === 'function') {
      return hostWin.requestAnimationFrame.bind(hostWin);
    }
    return (cb) => setTimeout(cb, 16);
  }

  function getSyncVolumeUIFallback() {
    const hostWin = getHostWindow();
    if (!hostWin) {
      return () => undefined;
    }
    return () => hostWin._syncVolumeUI?.();
  }

  function buildBaseDeps() {
    return {
      ...getGameDeps(),
      isGameStarted: () => refs._gameStarted?.(),
    };
  }

  return {
    initRefs,
    patchRefs,
    getRefs,
    getGameDeps,
    getRaf,
    getSyncVolumeUIFallback,
    buildBaseDeps,
  };
}
