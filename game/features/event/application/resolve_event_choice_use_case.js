import {
  lockEventFlow,
  unlockEventFlow,
} from '../state/event_runtime_flow_ports.js';
import { resolveEventChoiceAction } from './event_manager_actions.js';
import { buildEventViewModel } from './event_choice_view_model.js';

export function createResolveEventChoiceUseCase(options = {}) {
  const resolveChoice = options.resolveChoice || resolveEventChoiceAction;
  const resolveChoiceOptions = options.resolveChoiceOptions;
  const buildViewModel = options.buildViewModel || buildEventViewModel;
  const acquireEventLock = options.lockEventFlow || lockEventFlow;
  const releaseEventLock = options.unlockEventFlow || unlockEventFlow;

  return function resolveEventChoice(input = {}) {
    const {
      choiceIdx,
      event,
      gs,
      sharedData = {},
    } = input;

    if (!gs || !event) return null;

    acquireEventLock(gs);

    const resolution = resolveChoice(gs, event, choiceIdx, resolveChoiceOptions);
    const selectedChoice = event?.choices?.[choiceIdx];
    const viewModel = buildViewModel({
      event,
      resolution,
      selectedChoice,
      sharedData,
    });

    if (viewModel?.releaseLock) {
      releaseEventLock(gs);
    }

    return {
      resolution,
      selectedChoice,
      viewModel,
    };
  };
}
