import {
  closeLevelUpPopupRuntime,
  destroyLevelUpPopupRuntime,
  initLevelUpPopupRuntime,
  showLevelUpPopupRuntime,
} from './level_up_popup_runtime.js';

export class LevelUpPopupUI {
  constructor(deps = {}) {
    this.onClose = null;
    this._doc = deps.doc || document;
    this._win = deps.win || window;
    this._rafImpl = deps.raf || globalThis.requestAnimationFrame;
    this._cancelRafImpl = deps.cancelRaf || globalThis.cancelAnimationFrame;
    this._raf = null;
    this._particles = [];

    initLevelUpPopupRuntime(this);
  }

  show(payload) {
    showLevelUpPopupRuntime(this, payload);
  }

  close() {
    closeLevelUpPopupRuntime(this);
  }

  destroy() {
    destroyLevelUpPopupRuntime(this);
  }
}
