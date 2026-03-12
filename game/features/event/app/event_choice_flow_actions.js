import { playAttackSlash } from '../../../domain/audio/audio_event_helpers.js';
import { createFinishEventFlowUseCase } from '../../../app/event/use_cases/finish_event_flow_use_case.js';
import { createResolveEventChoiceUseCase } from '../../../app/event/use_cases/resolve_event_choice_use_case.js';
import { unlockEventFlow } from '../../../app/shared/use_cases/runtime_state_use_case.js';
import { presentEventChoiceResolution } from '../../../presentation/screens/event_choice_resolution_presenter.js';
import { renderEventContinueChoice } from '../presentation/event_continue_choice_presenter.js';
import {
  dismissEventModalRuntime,
  renderEventChoices,
} from '../platform/event_runtime_dom.js';

const finishEventFlowUseCase = createFinishEventFlowUseCase();

export function finishEventFlow(doc, gs, deps = {}, clearCurrentEvent = () => {}) {
  dismissEventModalRuntime(doc.getElementById('eventModal'), () => {
    finishEventFlowUseCase({
      gs,
      clearCurrentEvent,
      showGameplayScreen: deps.showGameplayScreen,
      switchScreen: deps.switchScreen,
      updateUI: deps.updateUI,
      renderMinimap: deps.renderMinimap,
      updateNextNodes: deps.updateNextNodes,
    });
  }, deps);
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

    presentEventChoiceResolution({
      doc,
      event,
      gs,
      onFinish,
      onRefreshGoldBar,
      onResolveChoice,
      renderChoices: renderEventChoices,
      renderContinueChoice: renderEventContinueChoice,
      showItemToast: deps.showItemToast,
      updateUI: deps.updateUI,
      viewModel,
    });

    return resolution;
  } catch (err) {
    console.error('[resolveEvent] choice effect error:', err);
    unlockEventFlow(gs);
    playAttackSlash(audioEngine);
    return null;
  }
}
