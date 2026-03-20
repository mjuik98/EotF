import { createFinishEventFlowUseCase } from '../finish_event_flow_use_case.js';
import { handleResolveEventChoiceFlowError } from './event_choice_flow_error_handler.js';
import { resolveEventChoiceExecution } from './event_choice_flow_services.js';
import { presentEventChoiceResolution } from '../../presentation/browser/event_choice_resolution_presenter.js';
import { renderEventContinueChoice } from '../../presentation/event_continue_choice_presenter.js';
import {
  dismissEventModalRuntime,
  renderEventChoices,
} from '../../platform/event_runtime_dom.js';

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
    const execution = resolveEventChoiceExecution({
      audioEngine,
      choiceIdx,
      deps,
      event,
      gs,
      sharedData,
      resolveChoice,
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
    return handleResolveEventChoiceFlowError(gs, audioEngine, err);
  }
}
