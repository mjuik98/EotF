import { playAttackSlash } from '../../domain/audio/audio_event_helpers.js';
import { createResolveEventChoiceUseCase } from '../../app/event/use_cases/resolve_event_choice_use_case.js';
import { unlockEventFlow } from '../../app/shared/use_cases/runtime_state_use_case.js';
import { dismissEventModal } from './event_ui_helpers.js';
import { renderChoices } from './event_ui_dom.js';

export function finishEventFlow(doc, gs, deps = {}, clearCurrentEvent = () => {}) {
  dismissEventModal(doc.getElementById('eventModal'), () => {
    clearCurrentEvent();
    unlockEventFlow(gs);
    if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
    if (typeof deps.updateUI === 'function') deps.updateUI();
    if (typeof deps.renderMinimap === 'function') deps.renderMinimap();
    if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
  });
}

function showToast(toast, showItemToast) {
  if (!toast || typeof showItemToast !== 'function') return;
  if (toast.options === undefined) {
    showItemToast(toast.payload);
    return;
  }
  showItemToast(toast.payload, toast.options);
}

export function renderEventContinueChoice(doc, onContinue) {
  const choicesEl = doc.getElementById('eventChoices');
  if (!choicesEl) return false;

  choicesEl.textContent = '';
  const continueBtn = doc.createElement('div');
  continueBtn.className = 'event-choice';
  continueBtn.id = 'eventChoiceContinue';
  continueBtn.textContent = '\uACC4\uC18D';
  continueBtn.addEventListener('click', onContinue, { once: true });
  choicesEl.appendChild(continueBtn);
  return true;
}

export function resolveEventChoiceFlow(choiceIdx, {
  gs,
  event,
  doc,
  audioEngine,
  deps = {},
  sharedData = deps?.data || {},
  resolveChoice,
  onResolveChoice,
  onFinish,
  onRefreshGoldBar,
} = {}) {
  if (!gs || !event || !doc) return null;

  try {
    const resolveEventChoice = createResolveEventChoiceUseCase({
      resolveChoice,
    });
    const execution = resolveEventChoice({
      choiceIdx,
      event,
      gs,
      sharedData,
    });
    const { resolution, viewModel } = execution || {};

    if (typeof deps.updateUI === 'function') deps.updateUI();
    onRefreshGoldBar?.();

    showToast(viewModel?.acquiredCardToast, deps.showItemToast);
    showToast(viewModel?.acquiredItemToast, deps.showItemToast);

    if (viewModel?.isItemShop) {
      return resolution;
    }

    if (viewModel?.finishImmediately) {
      onFinish?.();
      return resolution;
    }

    const descEl = doc.getElementById('eventDesc');
    if (descEl) descEl.textContent = viewModel?.resultText || '';

    showToast(viewModel?.upgradeToast, deps.showItemToast);

    if (viewModel?.rerenderChoices) {
      renderChoices(event, doc, gs, onResolveChoice);
      onRefreshGoldBar?.();
      return resolution;
    }

    if (viewModel?.continueChoice) {
      renderEventContinueChoice(doc, () => onFinish?.());
      return resolution;
    }

    return resolution;
  } catch (err) {
    console.error('[resolveEvent] choice effect error:', err);
    unlockEventFlow(gs);
    playAttackSlash(audioEngine);
    return null;
  }
}
