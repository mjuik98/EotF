import {
  closeRunEndScreenRuntime,
  destroyRunEndScreenRuntime,
  initRunEndScreenRuntime,
  showRunEndScreenRuntime,
} from '../../../../ui/title/run_end_screen_runtime.js';

export class RunEndScreenUI {
  constructor(deps = {}) {
    this.onClose = null;
    this._doc = deps.doc || deps.win?.document || null;
    const win = deps.win || this._doc?.defaultView || null;
    this._raf = deps.raf || win?.requestAnimationFrame?.bind?.(win) || null;
    this._setTimeout = deps.setTimeout || win?.setTimeout?.bind?.(win) || setTimeout;
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
