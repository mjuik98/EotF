import { createCodexUiState } from './codex_ui_controller.js';
import { ensureCodexUiStyle } from './codex_ui_style.js';
import {
  closeCodexRuntime,
  openCodexRuntime,
  renderCodexContentRuntime,
  setCodexTabRuntime,
} from './codex_ui_runtime.js';

const _state = createCodexUiState();

export const CodexUI = {
  openCodex(deps = {}) {
    ensureCodexUiStyle(deps.doc);
    openCodexRuntime(_state, this, deps);
  },

  closeCodex(deps = {}) {
    closeCodexRuntime(_state, deps);
  },

  setCodexTab(tab, deps = {}) {
    setCodexTabRuntime(_state, this, tab, deps);
  },

  renderCodexContent(deps = {}) {
    ensureCodexUiStyle(deps.doc);
    renderCodexContentRuntime(_state, this, deps);
  },
};
