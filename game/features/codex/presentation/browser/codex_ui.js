import { createCodexUiState } from '../../../../ui/screens/codex_ui_controller.js';
import {
  closeCodexRuntime,
  openCodexRuntime,
  renderCodexContentRuntime,
  setCodexTabRuntime,
} from '../../../../ui/screens/codex_ui_runtime.js';

const _state = createCodexUiState();

export const CodexUI = {
  openCodex(deps = {}) {
    openCodexRuntime(_state, this, deps);
  },

  closeCodex(deps = {}) {
    closeCodexRuntime(_state, deps);
  },

  setCodexTab(tab, deps = {}) {
    setCodexTabRuntime(_state, this, tab, deps);
  },

  renderCodexContent(deps = {}) {
    renderCodexContentRuntime(_state, this, deps);
  },
};
