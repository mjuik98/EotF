import { getDoc } from './help_pause_ui_helpers.js';
import {
  closePauseMenu,
  handleGlobalHotkey as handleGlobalHotkeyRuntime,
  swallowEscape as swallowEscapeRuntime,
} from './help_pause_ui_runtime.js';
import {
  toggleAbandonConfirmRuntime,
  toggleQuitGameConfirmRuntime,
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
let _abandonRuntimePromise = null;

export function __resetHelpPauseUiStateForTests() {
  _helpOpen = false;
  _pauseOpen = false;
  _hotkeysBound = false;
  _abandonRuntimePromise = null;
}

function resolveLiveDeps(deps = {}) {
  const nextDeps = typeof deps.getDeps === 'function' ? (deps.getDeps() || {}) : {};
  return {
    ...deps,
    ...nextDeps,
  };
}

async function loadAbandonRuntime() {
  if (!_abandonRuntimePromise) {
    _abandonRuntimePromise = import('./help_pause_ui_abandon_runtime.js')
      .catch((error) => {
        _abandonRuntimePromise = null;
        throw error;
      });
  }
  return _abandonRuntimePromise;
}

export const HelpPauseUI = {
  isHelpOpen() {
    return _helpOpen;
  },

  swallowEscape(event) {
    swallowEscapeRuntime(event);
  },

  handleGlobalHotkey(event, options = {}) {
    const resolvedDeps = resolveLiveDeps(options.deps || {});
    const doc = options.doc || getDoc(resolvedDeps);
    handleGlobalHotkeyRuntime(event, {
      deps: resolvedDeps,
      doc,
      ui: options.ui || this,
    });
  },

  showMobileWarning(deps = {}) {
    showMobileWarningRuntime(resolveLiveDeps(deps));
  },

  toggleHelp(deps = {}) {
    const resolvedDeps = resolveLiveDeps(deps);
    _helpOpen = toggleHelpOverlayRuntime(resolvedDeps, () => {
      _helpOpen = false;
    });
  },

  abandonRun(deps = {}) {
    const resolvedDeps = resolveLiveDeps(deps);
    toggleAbandonConfirmRuntime(resolvedDeps, () => this.confirmAbandon(resolvedDeps));
  },

  confirmReturnToTitle(deps = {}) {
    const resolvedDeps = resolveLiveDeps(deps);
    toggleReturnTitleConfirmRuntime({
      ...resolvedDeps,
      win: resolvedDeps?.win || getDoc(resolvedDeps)?.defaultView || null,
    });
  },

  confirmQuitGame(deps = {}) {
    const resolvedDeps = resolveLiveDeps(deps);
    toggleQuitGameConfirmRuntime({
      ...resolvedDeps,
      win: resolvedDeps?.win || getDoc(resolvedDeps)?.defaultView || null,
    });
  },

  async confirmAbandon(deps = {}) {
    const resolvedDeps = resolveLiveDeps(deps);
    const { confirmAbandonRun } = await loadAbandonRuntime();
    return confirmAbandonRun(resolvedDeps, (doc) => {
      closePauseMenu(doc, () => {
        _pauseOpen = false;
      });
    });
  },

  togglePause(deps = {}) {
    const resolvedDeps = resolveLiveDeps(deps);
    _pauseOpen = togglePauseMenuRuntime({
      deps: resolvedDeps,
      ui: this,
      currentPauseOpen: _pauseOpen,
      onPauseStateChange: (nextValue) => {
        _pauseOpen = nextValue;
      },
    });
  },

  bindGlobalHotkeys(deps = {}) {
    const doc = getDoc(resolveLiveDeps(deps));
    if (_hotkeysBound) return;
    _hotkeysBound = true;

    const self = this;
    doc.addEventListener('keydown', (e) => {
      const resolvedDeps = resolveLiveDeps(deps);
      handleGlobalHotkeyRuntime(e, {
        deps: resolvedDeps,
        doc: getDoc(resolvedDeps) || doc,
        ui: self,
      });
    }, true);
  },
};
