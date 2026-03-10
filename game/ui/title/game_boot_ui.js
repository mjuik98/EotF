import {
  fireWarpBurst,
  teardownTitleFx,
} from './game_boot_ui_fx.js';
import {
  getDoc,
  refreshTitleSaveState,
} from './game_boot_ui_helpers.js';
import {
  bootGameRuntime,
  bootWhenReadyRuntime,
} from './game_boot_ui_runtime.js';

export const GameBootUI = {
  refreshTitleSaveState(deps = {}) {
    const doc = getDoc(deps);
    return refreshTitleSaveState(doc, deps.saveSystem, deps.gs);
  },

  bootGame(deps = {}) {
    bootGameRuntime(this, deps);
  },

  fireWarpTransition(doc, onComplete = () => {}) {
    fireWarpBurst(doc, onComplete);
  },

  teardown() {
    teardownTitleFx();
  },

  bootWhenReady(deps = {}) {
    bootWhenReadyRuntime(this, deps);
  },
};
