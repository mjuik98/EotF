const state = {
  navIndex: -1,
  navItems: [],
  navBound: false,
};

export function setupKeyboardNav(doc) {
  state.navItems = Array.from(doc.querySelectorAll('#mainTitleSubScreen [data-nav]'));
  if (!state.navItems.length) return;

  const cursorEl = doc.getElementById('titleNavCursor');
  const menuPanel = doc.getElementById('titleMenuPanel');

  const updateCursor = (index) => {
    if (!cursorEl || !menuPanel) return;
    if (index < 0) {
      cursorEl.style.opacity = '0';
      return;
    }

    const target = state.navItems[index];
    if (!target) return;
    const panelRect = menuPanel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    cursorEl.style.opacity = '1';
    cursorEl.style.top = `${targetRect.top - panelRect.top + 4}px`;
    cursorEl.style.height = `${Math.max(18, targetRect.height - 8)}px`;
  };

  const setFocus = (index) => {
    state.navItems.forEach((item, itemIndex) => item.classList.toggle('kb-focus', itemIndex === index));
    state.navIndex = index;
    updateCursor(index);
  };

  const isVisibleItem = (item) => {
    const rect = item?.getBoundingClientRect?.();
    return Boolean(rect && rect.width > 0 && rect.height > 0);
  };

  const getNextVisibleIndex = (currentIndex, direction) => {
    let nextIndex = currentIndex;
    if (nextIndex < 0) {
      nextIndex = direction > 0 ? -1 : 0;
    }
    for (let i = 0; i < state.navItems.length; i += 1) {
      nextIndex = (nextIndex + direction + state.navItems.length) % state.navItems.length;
      if (isVisibleItem(state.navItems[nextIndex])) {
        return nextIndex;
      }
    }
    return Math.max(0, currentIndex);
  };

  state.navItems.forEach((item) => item.addEventListener('mouseenter', () => setFocus(-1)));
  if (state.navBound) return;
  state.navBound = true;

  doc.addEventListener('keydown', (event) => {
    const titleScreen = doc.getElementById('titleScreen');
    const mainScreen = doc.getElementById('mainTitleSubScreen');
    if (!titleScreen?.classList.contains('active') || mainScreen?.style.display === 'none') return;

    if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
      event.preventDefault();
      setFocus(getNextVisibleIndex(state.navIndex, 1));
      return;
    }

    if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      event.preventDefault();
      setFocus(getNextVisibleIndex(state.navIndex, -1));
      return;
    }

    if (event.key === 'Enter') {
      const preferredStartIndex = state.navItems.findIndex((item) => item.id === 'mainStartBtn' && isVisibleItem(item));
      const targetIndex = state.navIndex >= 0
        ? state.navIndex
        : preferredStartIndex >= 0
          ? preferredStartIndex
          : getNextVisibleIndex(-1, 1);
      if (targetIndex >= 0) {
        event.preventDefault();
        setFocus(targetIndex);
        state.navItems[targetIndex]?.click();
      }
      return;
    }

    if (event.key === 'n' || event.key === 'N') {
      const idx = state.navItems.findIndex((item) => item.id === 'mainStartBtn');
      if (idx >= 0) setFocus(idx);
      return;
    }

    if (event.key === 'c' || event.key === 'C') {
      const continueBtn = doc.getElementById('mainContinueBtn');
      if (!continueBtn || continueBtn.closest('#titleContinueWrap')?.style.display === 'none') return;
      const idx = state.navItems.findIndex((item) => item === continueBtn);
      if (idx >= 0) setFocus(idx);
    }
  });
}

export function resetKeyboardNav() {
  state.navIndex = -1;
  state.navItems = [];
  state.navBound = false;
}
