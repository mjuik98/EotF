import {
  closeRunEndScreenRuntime,
  destroyRunEndScreenRuntime,
  initRunEndScreenRuntime,
  showRunEndScreenRuntime,
} from './run_end_screen_runtime.js';

export class RunEndScreenUI {
  constructor(deps = {}) {
    this.onClose = null;
    this._doc = deps.doc || document;
    this._raf = deps.raf || globalThis.requestAnimationFrame;
    this._setTimeout = deps.setTimeout || globalThis.setTimeout;
    initRunEndScreenRuntime(this);
  }

  show(summary, classInfo = {}) {
    showRunEndScreenRuntime(this, summary, classInfo);
  }

  close() {
    closeRunEndScreenRuntime(this);
  }

  destroy() {
    destroyRunEndScreenRuntime(this);
  }
}
