import {
  countUp,
  fireWarpBurst,
  setupKeyboardNav,
  startAudioWave,
  startLoreTicker,
  teardownTitleFx,
} from './game_boot_ui_fx.js';
import {
  getDoc,
  refreshTitleSaveState,
} from './game_boot_ui_helpers.js';

export const GameBootUI = {
  refreshTitleSaveState(deps = {}) {
    const doc = getDoc(deps);
    return refreshTitleSaveState(doc, deps.saveSystem, deps.gs);
  },

  bootGame(deps = {}) {
    const gs = deps.gs;
    const doc = getDoc(deps);
    const audioEngine = deps.audioEngine;
    const runRules = deps.runRules;
    const saveSystem = deps.saveSystem;

    try {
      doc.addEventListener('click', () => {
        try {
          audioEngine?.init?.();
          audioEngine?.resume?.();
        } catch {
          // Ignore gesture-locked audio errors.
        }
      }, { once: false });

      try {
        saveSystem?.loadMeta?.(deps.saveSystemDeps || {});
      } catch (error) {
        console.error('[GameBootUI] loadMeta error:', error);
      }

      try {
        runRules?.ensureMeta?.(gs?.meta);
      } catch (error) {
        console.error('[GameBootUI] ensureMeta error:', error);
      }

      globalThis.setTimeout(() => {
        deps.initTitleCanvas?.();
        if (typeof globalThis.resizeTitleCanvas === 'function') {
          globalThis.resizeTitleCanvas();
        }
      }, 100);

      try {
        deps.updateUI?.();
      } catch (error) {
        console.warn('[GameBootUI] updateUI error:', error);
      }
      deps.refreshRunModePanel?.();

      startAudioWave(doc);
      startLoreTicker(doc);
      setupKeyboardNav(doc);

      const runCount = Math.max(0, (gs?.meta?.runCount ?? 1) - 1);
      if (runCount > 0) {
        const statsBlock = doc.getElementById('titleStatsBlock');
        if (statsBlock) statsBlock.style.display = 'block';
        globalThis.setTimeout(() => {
          countUp(doc.getElementById('titleTotalRuns'), runCount, 1100);
          countUp(doc.getElementById('titleTotalKills'), gs?.meta?.totalKills ?? 0, 1250);
          countUp(doc.getElementById('titleBestChain'), gs?.meta?.bestChain ?? 0, 1350);
        }, 350);
      }

      this.refreshTitleSaveState({ doc, saveSystem, gs });
    } catch (error) {
      console.error('[GameBootUI] boot error:', error);
    }
  },

  fireWarpTransition(doc, onComplete = () => {}) {
    fireWarpBurst(doc, onComplete);
  },

  teardown() {
    teardownTitleFx();
  },

  bootWhenReady(deps = {}) {
    const doc = getDoc(deps);
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', () => this.bootGame(deps));
      return;
    }
    this.bootGame(deps);
  },
};
