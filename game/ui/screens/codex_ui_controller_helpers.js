export function applyCodexModalOpen(modal) {
  if (!modal) return null;
  modal.classList.remove('fade-out');
  modal.style.display = 'flex';
  modal.classList.add('fade-in');
  return modal;
}

export function runCodexModalClose(modal, options = {}) {
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

export function runCodexTabTransition(doc, state, nextTab, options = {}) {
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
