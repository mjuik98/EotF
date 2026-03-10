export function setCharacterSelectVisibility(resolveById, isVisible, dir) {
  const card = resolveById?.('charCard');
  const panel = resolveById?.('infoPanel');
  if (!card || !panel) return;

  if (isVisible) {
    card.style.opacity = '1';
    card.style.transform = 'perspective(600px) scale(1)';
    panel.style.opacity = '1';
    panel.style.transform = 'translateX(0)';
    return;
  }

  card.style.opacity = '0';
  card.style.transform = `perspective(600px) translateX(${dir === 1 ? '-44px' : '44px'}) scale(.92)`;
  panel.style.opacity = '0';
  panel.style.transform = 'translateX(16px)';
}

export function createCharacterSelectFlow({
  state,
  chars,
  resolveById,
  sfx,
  updateAll,
  renderPhase,
  onConfirm,
  setTimeoutImpl = globalThis.setTimeout,
  log = (...args) => console.log(...args),
} = {}) {
  function setVisible(isVisible, dir) {
    setCharacterSelectVisibility(resolveById, isVisible, dir);
  }

  function go(dir) {
    if (state?.phase !== 'select') return;
    sfx?.nav?.();
    setVisible(false, dir);
    setTimeoutImpl?.(() => {
      state.idx = (state.idx + dir + chars.length) % chars.length;
      updateAll?.();
      setVisible(true);
    }, 250);
  }

  function jumpTo(index) {
    if (index === state?.idx || state?.phase !== 'select') return;
    sfx?.nav?.();
    setVisible(false, 0);
    setTimeoutImpl?.(() => {
      state.idx = index;
      updateAll?.();
      setVisible(true);
    }, 250);
  }

  function handleConfirm() {
    if (state?.phase !== 'select') return;
    const selectedChar = chars[state.idx];
    log?.('[CharacterSelectUI] Character selected:', selectedChar);
    sfx?.select?.();
    state.phase = 'burst';
    renderPhase?.();
    setTimeoutImpl?.(() => {
      state.phase = 'done';
      renderPhase?.();
      log?.('[CharacterSelectUI] Firing onConfirm callback');
      onConfirm?.(selectedChar);
    }, 650);
  }

  return {
    go,
    jumpTo,
    handleConfirm,
    setVisible,
  };
}
