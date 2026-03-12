import {
  getDoc,
} from './help_pause_ui_helpers.js';
import {
  closePauseMenu,
  handleGlobalHotkey,
} from './help_pause_ui_runtime.js';
import { confirmAbandonRun } from './help_pause_ui_abandon_runtime.js';
import {
  toggleAbandonConfirmRuntime,
  toggleReturnTitleConfirmRuntime,
} from './help_pause_ui_dialog_runtime.js';
import {
  showMobileWarningRuntime,
  toggleHelpOverlayRuntime,
} from './help_pause_ui_overlay_runtime.js';
import { togglePauseMenuRuntime } from './help_pause_ui_pause_runtime.js';

let _helpOpen = false;
let _pauseOpen = false;
let _hotkeysBound = false;

export const HelpPauseUI = {
  isHelpOpen() {
    return _helpOpen;
  },

  showMobileWarning(deps = {}) {
    showMobileWarningRuntime(deps);
  },

  toggleHelp(deps = {}) {
    _helpOpen = toggleHelpOverlayRuntime(deps, () => {
      _helpOpen = false;
    });
  },

  abandonRun(deps = {}) {
    toggleAbandonConfirmRuntime(deps, () => this.confirmAbandon(deps));
  },

  confirmReturnToTitle(deps = {}) {
    toggleReturnTitleConfirmRuntime({
      ...deps,
      win: deps?.win || getDoc(deps)?.defaultView || null,
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
    _pauseOpen = togglePauseMenuRuntime({
      deps,
      ui: this,
      currentPauseOpen: _pauseOpen,
      onPauseStateChange: (nextValue) => {
        _pauseOpen = nextValue;
      },
    });
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
