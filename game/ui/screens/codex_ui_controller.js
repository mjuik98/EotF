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
  if (!modal) return null;
  modal.classList.remove('fade-out');
  modal.style.display = 'flex';
  modal.classList.add('fade-in');
  return modal;
}

export function closeCodexModal(doc, options = {}) {
  const modal = doc?.getElementById?.('codexModal');
  if (!modal) return false;

  const {
    onBeforeHide,
    timeoutMs = 300,
    setTimeoutFn = setTimeout,
  } = options;

  onBeforeHide?.();
  modal.classList.remove('fade-in');
  modal.classList.add('fade-out');

  const onEnd = () => {
    modal.style.display = 'none';
    modal.classList.remove('fade-out');
    modal.removeEventListener?.('animationend', onEnd);
  };

  modal.addEventListener?.('animationend', onEnd);
  setTimeoutFn(() => {
    if (modal.style.display !== 'none') onEnd();
  }, timeoutMs);

  return true;
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
  const {
    force = false,
    onBeforeRender,
    onRender,
  } = options;

  if (nextTab === state.tab && !force) return false;

  state.filter = 'all';
  state.search = '';

  const searchInput = doc?.getElementById?.('cxSearch');
  if (searchInput) searchInput.value = '';

  if (state.isTransitioning) {
    state.tab = nextTab;
    onBeforeRender?.(nextTab);
    onRender?.(nextTab);
    return true;
  }

  state.isTransitioning = true;
  state.tab = nextTab;
  onBeforeRender?.(nextTab);

  const content = doc?.getElementById?.('codexContent');
  if (!content) {
    onRender?.(nextTab);
    state.isTransitioning = false;
    return true;
  }

  content.classList.add('cx-tab-exit');
  const onExit = () => {
    content.classList.remove('cx-tab-exit');
    content.removeEventListener?.('animationend', onExit);
    onRender?.(nextTab);
    content.classList.add('cx-tab-enter');
    const onEnter = () => {
      content.classList.remove('cx-tab-enter');
      content.removeEventListener?.('animationend', onEnter);
      state.isTransitioning = false;
    };
    content.addEventListener?.('animationend', onEnter);
  };
  content.addEventListener?.('animationend', onExit);

  return true;
}
