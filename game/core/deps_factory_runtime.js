export function createDepsFactoryRuntime() {
  let refs = {};

  function getFeatureDeps(feature = 'run') {
    const game = refs.GAME;
    if (!game) return {};

    if (feature === 'combat') return game.getCombatDeps?.() || {};
    if (feature === 'event') return game.getEventDeps?.() || {};
    if (feature === 'hud') return game.getHudDeps?.() || {};
    if (feature === 'ui') return game.getUiDeps?.() || {};
    if (feature === 'canvas') return game.getCanvasDeps?.() || {};
    return game.getRunDeps?.() || {};
  }

  function getHostObject() {
    try {
      return Function('return this')();
    } catch {
      return null;
    }
  }

  function getHostWindow() {
    const depsCandidates = [
      getFeatureDeps('ui'),
      getFeatureDeps('run'),
      getFeatureDeps('combat'),
      getGameDeps(),
    ];
    const gameDeps = depsCandidates.find((candidate) => candidate?.win || candidate?.doc?.defaultView) || {};
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

  function getRunDeps() {
    return getFeatureDeps('run');
  }

  function getCombatDeps() {
    return getFeatureDeps('combat');
  }

  function getEventDeps() {
    return getFeatureDeps('event');
  }

  function getHudDeps() {
    return getFeatureDeps('hud');
  }

  function getUiDeps() {
    return getFeatureDeps('ui');
  }

  function getCanvasDeps() {
    return getFeatureDeps('canvas');
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

  function buildBaseDeps(feature = 'run') {
    return {
      ...getFeatureDeps(feature),
      isGameStarted: () => refs._gameStarted?.(),
    };
  }

  return {
    initRefs,
    patchRefs,
    getRefs,
    getGameDeps,
    getRunDeps,
    getCombatDeps,
    getEventDeps,
    getHudDeps,
    getUiDeps,
    getCanvasDeps,
    getRaf,
    getSyncVolumeUIFallback,
    buildBaseDeps,
  };
}
