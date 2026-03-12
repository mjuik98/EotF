import {
  closeLevelUpPopupRuntime,
  destroyLevelUpPopupRuntime,
  initLevelUpPopupRuntime,
  showLevelUpPopupRuntime,
} from '../../../../ui/title/level_up_popup_runtime.js';

export class LevelUpPopupUI {
  constructor(deps = {}) {
    this.onClose = null;
    this._doc = deps.doc || deps.win?.document || null;
    this._win = deps.win || this._doc?.defaultView || null;
    this._rafImpl = deps.raf || this._win?.requestAnimationFrame?.bind?.(this._win) || null;
    this._cancelRafImpl = deps.cancelRaf || this._win?.cancelAnimationFrame?.bind?.(this._win) || null;
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
