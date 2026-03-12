import { lockEventFlow, unlockEventFlow } from '../../shared/use_cases/runtime_state_use_case.js';
import { buildEventViewModel } from './build_event_view_model.js';
import { resolveEventChoiceAction } from '../../../features/event/app/event_manager_actions.js';

export function createResolveEventChoiceUseCase(options = {}) {
  const resolveChoice = options.resolveChoice || resolveEventChoiceAction;
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

    const resolution = resolveChoice(gs, event, choiceIdx);
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
