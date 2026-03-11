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
    audio?.playClick?.();
    actions.continueRun?.();
  });
  bindClick(resolvedDoc, 'mainStartBtn', () => {
    audio?.playClick?.();
    actions.showCharacterSelect?.();
  });
  bindClick(resolvedDoc, 'mainRunRulesBtn', () => {
    audio?.playClick?.();
    actions.openRunSettings?.();
  });
  bindClick(resolvedDoc, 'mainCodexBtn', () => {
    audio?.playClick?.();
    actions.openCodexFromTitle?.();
  });
  bindClick(resolvedDoc, 'mainSettingsBtn', () => {
    audio?.playClick?.();
    actions.openSettings?.();
  });
  bindClick(resolvedDoc, 'mainQuitBtn', () => {
    audio?.playClick?.();
    actions.quitGame?.();
  });
  bindClick(resolvedDoc, 'startBtn', () => actions.startGame?.());
  bindClick(resolvedDoc, 'backToTitleBtn', () => actions.backToTitle?.());
  bindClick(resolvedDoc, 'runSettingsCloseBtn', () => {
    audio?.playClick?.();
    actions.closeRunSettings?.();
  });
  bindClick(resolvedDoc, 'runSettingsConfirmBtn', () => {
    audio?.playClick?.();
    actions.closeRunSettings?.();
  });
  bindClick(resolvedDoc, 'endlessToggleBtn', () => {
    audio?.playClick?.();
    actions.toggleEndlessMode?.();
  });
  bindClick(resolvedDoc, 'curseCycleBtn', () => {
    audio?.playClick?.();
    actions.cycleRunCurse?.();
  });
  bindClick(resolvedDoc, 'toggleInscriptionLayoutBtn', () => {
    audio?.playClick?.();
  });
  bindClick(resolvedDoc, 'toggleAllInscriptionsBtn', () => {
    audio?.playClick?.();
  });

  resolvedDoc.querySelectorAll?.('.run-mode-stepper .run-mode-btn')?.forEach?.((button, index) => {
    button.addEventListener('click', () => {
      audio?.playClick?.();
      actions.shiftAscension?.(index === 0 ? -1 : 1);
    });
  });

  const classContainer = resolvedDoc.getElementById('classSelectContainer');
  classContainer?.addEventListener?.('click', (event) => {
    const button = event.target?.closest?.('.class-btn');
    if (button) actions.selectClass?.(button);
  });
}
