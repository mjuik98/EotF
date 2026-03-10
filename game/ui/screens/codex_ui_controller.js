import {
  applyCodexModalOpen,
  runCodexModalClose,
  runCodexTabTransition,
} from './codex_ui_controller_helpers.js';

export function createCodexUiState() {
  return {
    tab: 'enemies',
    filter: 'all',
    sort: 'default',
    search: '',
    showUnknown: true,
    isTransitioning: false,
    deps: null,
    popupList: [],
    popupIndex: 0,
    popupOpenFn: null,
  };
}

export function resetCodexUiState(state, deps = null) {
  state.tab = 'enemies';
  state.filter = 'all';
  state.sort = 'default';
  state.search = '';
  state.showUnknown = true;
  state.isTransitioning = false;
  state.deps = deps;
  state.popupList = [];
  state.popupIndex = 0;
  state.popupOpenFn = null;
  return state;
}

export function showCodexModal(doc) {
  const modal = doc?.getElementById?.('codexModal');
  return applyCodexModalOpen(modal);
}

export function closeCodexModal(doc, options = {}) {
  const modal = doc?.getElementById?.('codexModal');
  return runCodexModalClose(modal, options);
}

export function setCodexPopupNavigation(state, currentEntry, list, openFn) {
  if (Array.isArray(list)) {
    state.popupList = list;
    const nextIndex = list.indexOf(currentEntry);
    state.popupIndex = nextIndex >= 0 ? nextIndex : 0;
  }
  if (typeof openFn === 'function') state.popupOpenFn = openFn;
  return state;
}

export function clearCodexPopupNavigation(state) {
  state.popupList = [];
  state.popupIndex = 0;
  state.popupOpenFn = null;
  return state;
}

export function navigateCodexPopup(state, dir) {
  if (typeof state.popupOpenFn !== 'function') return null;
  const nextIndex = state.popupIndex + dir;
  if (nextIndex < 0 || nextIndex >= state.popupList.length) return null;
  state.popupIndex = nextIndex;
  const nextEntry = state.popupList[nextIndex];
  state.popupOpenFn(nextEntry, state.popupList, nextIndex);
  return nextEntry;
}

export function transitionCodexTab(doc, state, nextTab, options = {}) {
  return runCodexTabTransition(doc, state, nextTab, options);
}
