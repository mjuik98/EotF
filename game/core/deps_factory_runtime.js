export function createDepsFactoryRuntime() {
  let refs = {};

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
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      return window.requestAnimationFrame.bind(window);
    }
    return (cb) => setTimeout(cb, 16);
  }

  function getSyncVolumeUIFallback() {
    if (typeof window === 'undefined') {
      return () => undefined;
    }
    return () => window._syncVolumeUI?.();
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
