import {
  getLegacyFeatureDeps,
  getLegacyGameDeps,
} from '../platform/legacy/public.js';

export function createDepsFactoryRuntime() {
  let refs = {};

  function getRuntimePorts() {
    return refs.runtimePorts || refs.runtimeDeps || null;
  }

  function getFeatureDeps(feature = 'run') {
    const runtimePorts = getRuntimePorts();
    if (typeof runtimePorts?.getFeatureDeps === 'function') {
      return runtimePorts.getFeatureDeps(feature) || {};
    }
    if (runtimePorts) {
      if (feature === 'combat') return runtimePorts.getCombatRuntimeDeps?.() || {};
      if (feature === 'event') return runtimePorts.getEventRuntimeDeps?.() || {};
      if (feature === 'hud') return runtimePorts.getHudRuntimeDeps?.() || {};
      if (feature === 'ui') return runtimePorts.getUiRuntimeDeps?.() || {};
      if (feature === 'canvas') return runtimePorts.getCanvasRuntimeDeps?.() || {};
      if (runtimePorts.getRunRuntimeDeps) return runtimePorts.getRunRuntimeDeps() || {};
      if (runtimePorts.getRuntimeDeps) return runtimePorts.getRuntimeDeps() || {};
    }
    return getLegacyFeatureDeps(refs.GAME, feature);
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
    const runtimePorts = getRuntimePorts();
    if (typeof runtimePorts?.getGameDeps === 'function') {
      return runtimePorts.getGameDeps() || {};
    }
    return getLegacyGameDeps(refs.GAME);
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
