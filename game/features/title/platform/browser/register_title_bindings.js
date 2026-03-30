import { playUiClick } from '../../ports/public_audio_presentation_capabilities.js';
import { closeTopEscapeSurface } from '../../../run_session/ports/public_hotkey_capabilities.js';

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

    if (closeTopEscapeSurface(event, {
      actions,
      doc: resolvedDoc,
      scope: 'title',
    })) {
      return;
    }

    const characterSelect = resolvedDoc.getElementById('charSelectSubScreen');
    if (characterSelect && characterSelect.style.display === 'block') {
      actions.backToTitle?.();
    }
  });

  resolvedDoc.addEventListener('click', (event) => {
    if (event.target?.closest?.('#backToTitleBtn')) {
      actions.backToTitle?.();
      return;
    }

    const classButton = event.target?.closest?.('.class-btn');
    if (classButton) actions.selectClass?.(classButton);
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
}
