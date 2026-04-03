import {
  countUp,
  setupKeyboardNav,
  startAudioWave,
  startLoreTicker,
} from './game_boot_ui_fx.js';
import { getDoc, getWin } from './game_boot_ui_helpers.js';
import { preloadAssetDomain } from '../../platform/browser/title_asset_runtime.js';

function getLogger(deps = {}) {
  return deps.logger || null;
}

function bindTimer(fn, context) {
  if (typeof fn !== 'function') return fn;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

function getTimerApi(deps = {}) {
  const timerHost = deps.timerHost || getWin(deps) || null;
  const timerContext = deps.timerContext || timerHost;
  return {
    setTimeout: bindTimer(
      deps.setTimeout || timerHost?.setTimeout || setTimeout,
      timerContext,
    ),
    clearTimeout: bindTimer(
      deps.clearTimeout || timerHost?.clearTimeout || clearTimeout,
      timerContext,
    ),
    setInterval: bindTimer(
      deps.setInterval || timerHost?.setInterval || setInterval,
      timerContext,
    ),
    clearInterval: bindTimer(
      deps.clearInterval || timerHost?.clearInterval || clearInterval,
      timerContext,
    ),
  };
}

function registerAudioUnlock(doc, audioEngine) {
  doc.addEventListener('click', () => {
    try {
      audioEngine?.init?.();
      audioEngine?.resume?.();
    } catch {
      // Ignore gesture-locked audio errors.
    }
  }, { once: false });
}

function loadBootMeta(saveSystem, deps) {
  try {
    saveSystem?.loadMeta?.(deps.saveSystemDeps || {});
  } catch (error) {
    getLogger(deps)?.error?.('[GameBootUI] loadMeta error:', error);
  }
}

function flushOutbox(saveSystem, deps = {}) {
  try {
    saveSystem?.flushOutbox?.();
  } catch (error) {
    getLogger(deps)?.warn?.('[GameBootUI] flushOutbox error:', error);
  }
}

function ensureRunMeta(runRules, gs, deps = {}) {
  try {
    runRules?.ensureMeta?.(gs?.meta);
  } catch (error) {
    getLogger(deps)?.error?.('[GameBootUI] ensureMeta error:', error);
  }
}

function scheduleTitleCanvasInit(deps, timers, win) {
  timers.setTimeout(() => {
    deps.initTitleCanvas?.();
    if (typeof deps.resizeTitleCanvas === 'function') {
      deps.resizeTitleCanvas();
    } else if (typeof win?.resizeTitleCanvas === 'function') {
      win.resizeTitleCanvas();
    }
  }, 100);
}

function refreshTitlePanels(deps) {
  try {
    deps.updateUI?.();
  } catch (error) {
    getLogger(deps)?.warn?.('[GameBootUI] updateUI error:', error);
  }
  deps.refreshRunModePanel?.();
}

function preloadTitleAssets(deps = {}) {
  if (!deps?.data?.assetManifest?.characters) return;
  Promise.resolve(
    preloadAssetDomain(deps.data, 'characters', {
      createImage: deps.createImage || (() => (typeof Image !== 'undefined' ? new Image() : null)),
    }),
  ).catch(() => {});
}

function scheduleTitleStats(doc, gs, timers) {
  const runCount = Math.max(0, (gs?.meta?.runCount ?? 1) - 1);
  if (runCount <= 0) return;

  const statsBlock = doc.getElementById('titleStatsBlock');
  if (statsBlock) statsBlock.style.display = 'block';

  timers.setTimeout(() => {
    countUp(doc.getElementById('titleTotalRuns'), runCount, 1100);
    countUp(doc.getElementById('titleTotalKills'), gs?.meta?.totalKills ?? 0, 1250);
    countUp(doc.getElementById('titleBestChain'), gs?.meta?.bestChain ?? 0, 1350);
  }, 350);
}

function bindOutboxRecoveryVisibility(doc, saveSystem, onVisibleRefresh) {
  if (!doc?.addEventListener || doc.__titleOutboxRecoveryBound) return;
  doc.__titleOutboxRecoveryBound = true;
  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState !== 'visible') return;
    flushOutbox(saveSystem);
    onVisibleRefresh?.();
  });
}

export function bootGameRuntime(ui, deps = {}) {
  const gs = deps.gs;
  const doc = getDoc(deps);
  const win = getWin(deps);
  const timers = getTimerApi(deps);
  const audioEngine = deps.audioEngine;
  const runRules = deps.runRules;
  const saveSystem = deps.saveSystem;

  try {
    registerAudioUnlock(doc, audioEngine);
    flushOutbox(saveSystem, deps);
    loadBootMeta(saveSystem, deps);
    ensureRunMeta(runRules, gs, deps);
    preloadTitleAssets(deps);
    scheduleTitleCanvasInit(deps, timers, win);
    refreshTitlePanels(deps);

    startAudioWave(doc, { win });
    startLoreTicker(doc, {
      win,
      setTimeout: timers.setTimeout,
      clearTimeout: timers.clearTimeout,
      setInterval: timers.setInterval,
      clearInterval: timers.clearInterval,
    });
    setupKeyboardNav(doc);
    scheduleTitleStats(doc, gs, timers);
    bindOutboxRecoveryVisibility(doc, saveSystem, () => {
      ui.refreshTitleSaveState({ doc, saveSystem, gs });
    });

    ui.refreshTitleSaveState({ doc, saveSystem, gs });
  } catch (error) {
    getLogger(deps)?.error?.('[GameBootUI] boot error:', error);
  }
}

export function bootWhenReadyRuntime(ui, deps = {}) {
  const doc = getDoc(deps);
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', () => ui.bootGame(deps));
    return false;
  }

  ui.bootGame(deps);
  return true;
}
