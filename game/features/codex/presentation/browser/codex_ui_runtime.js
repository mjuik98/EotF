import {
  ensureCodexState,
  getBaseCodexCards,
  getCodexDoc,
} from './codex_ui_helpers.js';
import {
  closeCodexDetailPopup,
} from './codex_ui_popup_runtime.js';
import {
  renderCodexRuntimeFilterBar,
  renderCodexRuntimeProgress,
} from './codex_ui_runtime_helpers.js';
import {
  injectCodexModalStructure,
  setCodexTabState,
} from './codex_ui_structure.js';
import { ensureCodexModalShell } from '../../platform/browser/ensure_codex_modal_shell.js';
import {
  closeCodexModal,
  navigateCodexPopup,
  resetCodexUiState,
  showCodexModal,
  transitionCodexTab,
} from './codex_ui_controller.js';
import {
  applyCodexTabTransition,
  createCodexModalCallbacks,
  renderCodexTabContent,
} from './codex_ui_runtime_dispatch.js';
import {
  keyboardEventMatchesCode,
} from '../../integration/ui_support_capabilities.js';

export function openCodexRuntime(state, ui, deps = {}) {
  ensureCodexState(deps.gs);
  resetCodexUiState(state, deps);

  const doc = getCodexDoc(deps);
  ensureCodexModalShell(doc);
  bindCodexGlobalKeys(state, deps);
  showCodexModal(doc);
  injectCodexModalStructure(doc, createCodexModalCallbacks(state, ui));
  doc?.getElementById?.('cxSearch')?.focus?.();
  renderCodexRuntimeProgress(state, ui, doc, deps.gs, deps.data);
  setCodexTabState(doc, state.tab);
  renderCodexRuntimeFilterBar(state, ui, doc, deps.data);
  ui.renderCodexContent(deps);
}

export function closeCodexRuntime(state, deps = {}) {
  const doc = getCodexDoc(deps);
  closeCodexModal(doc, {
    onBeforeHide: () => closeCodexDetailPopup(state, doc),
  });
}

export function setCodexTabRuntime(state, ui, tab, deps = {}) {
  const doc = getCodexDoc(deps);
  state.deps = deps;
  applyCodexTabTransition(state, ui, doc, { ...deps, tab }, transitionCodexTab);
}

export function renderCodexContentRuntime(state, ui, deps = {}) {
  state.deps = deps;
  const { gs, data } = deps;
  if (!gs || !data) return;

  const doc = getCodexDoc(deps);
  const content = doc.getElementById('codexContent');
  if (!content) return;

  const codex = ensureCodexState(gs);
  renderCodexTabContent(state, ui, doc, deps, codex, getBaseCodexCards);
}

export function bindCodexGlobalKeys(state, deps = {}) {
  const doc = getCodexDoc(deps);
  if (!doc?.addEventListener || state._codexKeyDoc === doc) return;
  if (state._codexKeyDoc && state._codexKeyHandler) {
    state._codexKeyDoc.removeEventListener?.('keydown', state._codexKeyHandler);
  }

  const onKeyDown = (event) => {
    const popup = doc.getElementById('cxDetailPopup');
    if (!popup?.classList.contains('open')) return;
    if (keyboardEventMatchesCode(event, 'ArrowRight')) navigateCodexPopup(state, 1);
    if (keyboardEventMatchesCode(event, 'ArrowLeft')) navigateCodexPopup(state, -1);
  };

  doc.addEventListener('keydown', onKeyDown);
  state._codexKeyDoc = doc;
  state._codexKeyHandler = onKeyDown;
}
