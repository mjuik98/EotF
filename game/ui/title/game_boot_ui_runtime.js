import {
  countUp,
  setupKeyboardNav,
  startAudioWave,
  startLoreTicker,
} from './game_boot_ui_fx.js';
import { getDoc } from './game_boot_ui_helpers.js';

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
    console.error('[GameBootUI] loadMeta error:', error);
  }
}

function ensureRunMeta(runRules, gs) {
  try {
    runRules?.ensureMeta?.(gs?.meta);
  } catch (error) {
    console.error('[GameBootUI] ensureMeta error:', error);
  }
}

function scheduleTitleCanvasInit(deps) {
  globalThis.setTimeout(() => {
    deps.initTitleCanvas?.();
    if (typeof globalThis.resizeTitleCanvas === 'function') {
      globalThis.resizeTitleCanvas();
    }
  }, 100);
}

function refreshTitlePanels(deps) {
  try {
    deps.updateUI?.();
  } catch (error) {
    console.warn('[GameBootUI] updateUI error:', error);
  }
  deps.refreshRunModePanel?.();
}

function scheduleTitleStats(doc, gs) {
  const runCount = Math.max(0, (gs?.meta?.runCount ?? 1) - 1);
  if (runCount <= 0) return;

  const statsBlock = doc.getElementById('titleStatsBlock');
  if (statsBlock) statsBlock.style.display = 'block';

  globalThis.setTimeout(() => {
    countUp(doc.getElementById('titleTotalRuns'), runCount, 1100);
    countUp(doc.getElementById('titleTotalKills'), gs?.meta?.totalKills ?? 0, 1250);
    countUp(doc.getElementById('titleBestChain'), gs?.meta?.bestChain ?? 0, 1350);
  }, 350);
}

export function bootGameRuntime(ui, deps = {}) {
  const gs = deps.gs;
  const doc = getDoc(deps);
  const audioEngine = deps.audioEngine;
  const runRules = deps.runRules;
  const saveSystem = deps.saveSystem;

  try {
    registerAudioUnlock(doc, audioEngine);
    loadBootMeta(saveSystem, deps);
    ensureRunMeta(runRules, gs);
    scheduleTitleCanvasInit(deps);
    refreshTitlePanels(deps);

    startAudioWave(doc);
    startLoreTicker(doc);
    setupKeyboardNav(doc);
    scheduleTitleStats(doc, gs);

    ui.refreshTitleSaveState({ doc, saveSystem, gs });
  } catch (error) {
    console.error('[GameBootUI] boot error:', error);
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
