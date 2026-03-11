import { playUiClick } from '../../../domain/audio/audio_event_helpers.js';

function bindClick(doc, id, handler) {
  doc?.getElementById?.(id)?.addEventListener?.('click', handler);
}

export function registerTitleBindings({
  actions,
  audio,
  doc = null,
  getIsTitleScreen = () => false,
  isEscapeKey = (event) => event?.key === 'Escape' || event?.key === 'Esc',
  isVisibleModal = () => false,
}) {
  const resolvedDoc = doc || (typeof document !== 'undefined' ? document : null);
  if (!resolvedDoc) return;

  resolvedDoc.addEventListener('keydown', (event) => {
    if (!getIsTitleScreen()) return;
    if (!isEscapeKey(event)) return;

    const codexModal = resolvedDoc.getElementById('codexModal');
    if (isVisibleModal(codexModal)) {
      actions.closeCodex?.();
      return;
    }

    const runSettings = resolvedDoc.getElementById('runSettingsModal');
    if (isVisibleModal(runSettings)) {
      actions.closeRunSettings?.();
      return;
    }

    const settingsModal = resolvedDoc.getElementById('settingsModal');
    if (isVisibleModal(settingsModal)) {
      actions.closeSettings?.();
      return;
    }

    const characterSelect = resolvedDoc.getElementById('charSelectSubScreen');
    if (characterSelect && characterSelect.style.display === 'block') {
      actions.backToTitle?.();
    }
  });

  bindClick(resolvedDoc, 'mainContinueBtn', () => {
    playUiClick(audio);
    actions.continueRun?.();
  });
  bindClick(resolvedDoc, 'mainStartBtn', () => {
    playUiClick(audio);
    actions.showCharacterSelect?.();
  });
  bindClick(resolvedDoc, 'mainRunRulesBtn', () => {
    playUiClick(audio);
    actions.openRunSettings?.();
  });
  bindClick(resolvedDoc, 'mainCodexBtn', () => {
    playUiClick(audio);
    actions.openCodexFromTitle?.();
  });
  bindClick(resolvedDoc, 'mainSettingsBtn', () => {
    playUiClick(audio);
    actions.openSettings?.();
  });
  bindClick(resolvedDoc, 'mainQuitBtn', () => {
    playUiClick(audio);
    actions.quitGame?.();
  });
  bindClick(resolvedDoc, 'startBtn', () => actions.startGame?.());
  bindClick(resolvedDoc, 'backToTitleBtn', () => actions.backToTitle?.());
  bindClick(resolvedDoc, 'runSettingsCloseBtn', () => {
    playUiClick(audio);
    actions.closeRunSettings?.();
  });
  bindClick(resolvedDoc, 'runSettingsConfirmBtn', () => {
    playUiClick(audio);
    actions.closeRunSettings?.();
  });
  bindClick(resolvedDoc, 'endlessToggleBtn', () => {
    playUiClick(audio);
    actions.toggleEndlessMode?.();
  });
  bindClick(resolvedDoc, 'curseCycleBtn', () => {
    playUiClick(audio);
    actions.cycleRunCurse?.();
  });
  bindClick(resolvedDoc, 'toggleInscriptionLayoutBtn', () => {
    playUiClick(audio);
  });
  bindClick(resolvedDoc, 'toggleAllInscriptionsBtn', () => {
    playUiClick(audio);
  });

  resolvedDoc.querySelectorAll?.('.run-mode-stepper .run-mode-btn')?.forEach?.((button, index) => {
    button.addEventListener('click', () => {
      playUiClick(audio);
      actions.shiftAscension?.(index === 0 ? -1 : 1);
    });
  });

  const classContainer = resolvedDoc.getElementById('classSelectContainer');
  classContainer?.addEventListener?.('click', (event) => {
    const button = event.target?.closest?.('.class-btn');
    if (button) actions.selectClass?.(button);
  });
}
