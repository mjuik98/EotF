import { Logger } from '../../../shared/logging/public.js';

const CharacterSelectLogger = Logger.child('CharacterSelectUI');

function resolveSelectedClassKey(selectedChar) {
  if (selectedChar?.class !== undefined && selectedChar?.class !== null) {
    return selectedChar.class;
  }
  if (selectedChar?.id !== undefined) {
    return selectedChar.id;
  }
  return null;
}

export function confirmCharacterSelection({
  state,
  chars,
  sfx,
  renderPhase,
  onConfirm,
  setTimeoutImpl = setTimeout,
  log = (...args) => CharacterSelectLogger.info(...args),
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
      const selectedClassKey = resolveSelectedClassKey(selectedChar);
      if (selectedClassKey !== null) {
        fns.selectClass?.(selectedClassKey);
      }
    },

    onBack() {
      fns.backToTitle?.();
    },

    onStart(selectedChar) {
      const selectedClassKey = resolveSelectedClassKey(selectedChar);
      if (selectedClassKey !== null) {
        fns.selectClass?.(selectedClassKey);
      }
      fns.startGame?.();
    },
  };
}
