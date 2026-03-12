export function confirmCharacterSelection({
  state,
  chars,
  sfx,
  renderPhase,
  onConfirm,
  setTimeoutImpl = setTimeout,
  log = (...args) => console.log(...args),
} = {}) {
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

export function createCharacterSelectMountActions({ fns = {} } = {}) {
  return {
    onConfirm(selectedChar) {
      if (selectedChar?.id !== undefined) {
        fns.selectClass?.(selectedChar.id);
      }
    },

    onBack() {
      fns.backToTitle?.();
    },

    onStart(selectedChar) {
      if (selectedChar?.id !== undefined) {
        fns.selectClass?.(selectedChar.id);
      }
      fns.startGame?.();
    },
  };
}
