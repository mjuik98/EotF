import { buildEventViewModel } from './build_event_view_model.js';
import { resolveEventChoiceAction } from '../../../features/event/app/event_manager_actions.js';

export function createResolveEventChoiceUseCase(options = {}) {
  const resolveChoice = options.resolveChoice || resolveEventChoiceAction;
  const buildViewModel = options.buildViewModel || buildEventViewModel;

  return function resolveEventChoice(input = {}) {
    const {
      choiceIdx,
      event,
      gs,
      sharedData = {},
    } = input;

    if (!gs || !event) return null;

    gs._eventLock = true;

    const resolution = resolveChoice(gs, event, choiceIdx);
    const selectedChoice = event?.choices?.[choiceIdx];
    const viewModel = buildViewModel({
      event,
      resolution,
      selectedChoice,
      sharedData,
    });

    if (viewModel?.releaseLock) {
      gs._eventLock = false;
    }

    return {
      resolution,
      selectedChoice,
      viewModel,
    };
  };
}
