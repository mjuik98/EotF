import {
  getDoc,
  isVisibleModal,
} from './help_pause_ui_helpers.js';
import {
  createAbandonConfirm,
  createHelpMenu,
  createMobileWarning,
  createPauseMenu,
  createReturnTitleConfirm,
} from './help_pause_ui_overlays.js';
import {
  closePauseMenu,
  createPauseMenuCallbacks,
  handleGlobalHotkey,
  saveRunBeforeReturn,
} from './help_pause_ui_runtime.js';
import { confirmAbandonRun } from './help_pause_ui_abandon_runtime.js';

let _helpOpen = false;
let _pauseOpen = false;
let _hotkeysBound = false;

export const HelpPauseUI = {
  isHelpOpen() {
    return _helpOpen;
  },

  showMobileWarning(deps = {}) {
    const doc = getDoc(deps);
    const isMobile = globalThis.innerWidth < 900 || 'ontouchstart' in globalThis;
    if (!isMobile || doc.getElementById('mobileWarn')) return;

    const warn = createMobileWarning(doc, () => warn.remove());
    doc.body.appendChild(warn);
  },

  toggleHelp(deps = {}) {
    const doc = getDoc(deps);
    _helpOpen = !_helpOpen;

    if (_helpOpen) {
      const menu = createHelpMenu(doc, deps, () => this.toggleHelp(deps));
      doc.body.appendChild(menu);
      return;
    }

    doc.getElementById('helpMenu')?.remove();
  },

  abandonRun(deps = {}) {
    const doc = getDoc(deps);
    const confirmEl = createAbandonConfirm(
      doc,
      () => confirmEl.remove(),
      () => this.confirmAbandon(deps),
    );
    doc.body.appendChild(confirmEl);
  },

  confirmReturnToTitle(deps = {}) {
    const doc = getDoc(deps);
    const old = doc.getElementById('returnTitleConfirm');
    if (old) {
      old.remove();
      return;
    }

    const confirmEl = createReturnTitleConfirm(
      doc,
      () => confirmEl.remove(),
      () => {
        confirmEl.remove();
        saveRunBeforeReturn(deps);
        location.reload();
      },
    );
    doc.body.appendChild(confirmEl);
  },

  confirmAbandon(deps = {}) {
    confirmAbandonRun(deps, (doc) => {
      closePauseMenu(doc, () => {
        _pauseOpen = false;
      });
    });
  },

  togglePause(deps = {}) {
    const gs = resolveGs(deps);
    if (!gs) return;

    const doc = getDoc(deps);
    const existingMenu = doc.getElementById('pauseMenu');
    _pauseOpen = isVisibleModal(existingMenu, doc);
    if (_pauseOpen) {
      closePauseMenu(doc, () => {
        _pauseOpen = false;
      });
      return;
    }

    _pauseOpen = true;
    const menu = createPauseMenu(
      doc,
      gs,
      deps,
      createPauseMenuCallbacks({
        deps,
        ui: this,
      }),
    );

    doc.body.appendChild(menu);
    if (typeof deps._syncVolumeUI === 'function') deps._syncVolumeUI();
  },

  bindGlobalHotkeys(deps = {}) {
    const doc = getDoc(deps);
    if (_hotkeysBound) return;
    _hotkeysBound = true;

    const self = this;
    doc.addEventListener('keydown', (e) => {
      handleGlobalHotkey(e, { deps, doc, ui: self });
    }, true);
  },
};
