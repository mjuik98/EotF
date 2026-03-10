import {
  getGameCanvasRefs,
  initGameCanvasRuntime,
  resizeGameCanvasRuntime,
} from './game_canvas_setup_ui_runtime.js';

const _state = {
  gameCanvas: null,
  gameCtx: null,
  minimapCanvas: null,
  minimapCtx: null,
  combatCanvas: null,
  resizeBound: false,
};

export const GameCanvasSetupUI = {
  getRefs() {
    return getGameCanvasRefs(_state);
  },

  init(deps = {}) {
    return initGameCanvasRuntime(_state, this, deps);
  },

  resize(deps = {}) {
    resizeGameCanvasRuntime(_state, deps);
  },
};
