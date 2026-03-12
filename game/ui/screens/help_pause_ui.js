import {
  getDoc,
  isVisibleModal,
  resolveGs,
} from './help_pause_ui_helpers.js';
import {
  createHelpMenu,
  createMobileWarning,
  createPauseMenu,
} from './help_pause_ui_overlays.js';
import {
  closePauseMenu,
  createPauseMenuCallbacks,
  handleGlobalHotkey,
} from './help_pause_ui_runtime.js';
import { confirmAbandonRun } from './help_pause_ui_abandon_runtime.js';
import {
  toggleAbandonConfirmRuntime,
  toggleReturnTitleConfirmRuntime,
} from './help_pause_ui_dialog_runtime.js';

let _helpOpen = false;
let _pauseOpen = false;
let _hotkeysBound = false;

function getWin(deps = {}, doc = null) {
  return deps?.win || doc?.defaultView || null;
}

export const HelpPauseUI = {
  isHelpOpen() {
    return _helpOpen;
  },

  showMobileWarning(deps = {}) {
    const doc = getDoc(deps);
    const win = getWin(deps, doc);
    const isMobile = Boolean(win && (win.innerWidth < 900 || 'ontouchstart' in win));
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
    toggleAbandonConfirmRuntime(deps, () => this.confirmAbandon(deps));
  },

  confirmReturnToTitle(deps = {}) {
    toggleReturnTitleConfirmRuntime({
      ...deps,
      win: getWin(deps, getDoc(deps)),
    });
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
