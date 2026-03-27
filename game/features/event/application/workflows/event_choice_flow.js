import { createFinishEventFlowUseCase } from '../finish_event_flow_use_case.js';
import { handleResolveEventChoiceFlowError } from './event_choice_flow_error_handler.js';
import { resolveEventChoiceExecution } from './event_choice_flow_services.js';

const finishEventFlowUseCase = createFinishEventFlowUseCase();

export function finishEventFlow(doc, gs, deps = {}, clearCurrentEvent = () => {}) {
  const flowUi = deps?.flowUi;
  if (!flowUi?.dismissModal) return;

  flowUi.dismissModal(doc, () => {
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
  flowUi = deps?.flowUi,
  sharedData = deps?.data || {},
  resolveChoice,
  onResolveChoice,
  onFinish,
  onRefreshGoldBar,
} = {}) {
  if (!gs || !event || !doc || !flowUi?.presentResolution) return null;

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

    flowUi.presentResolution({
      doc,
      event,
      gs,
      onFinish,
      onRefreshGoldBar,
      onResolveChoice,
      showItemToast: deps.showItemToast,
      updateUI: deps.updateUI,
      viewModel,
    });

    return resolution;
  } catch (err) {
    return handleResolveEventChoiceFlowError(gs, audioEngine, err);
  }
}
