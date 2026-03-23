import {
  createDiscardEventCardUseCase,
  discardEventCard,
} from '../application/discard_event_card_use_case.js';
import { createFinishEventFlowUseCase } from '../application/finish_event_flow_use_case.js';
import { createResolveEventChoiceUseCase } from '../application/resolve_event_choice_use_case.js';
import { createResolveEventSessionUseCase } from '../application/resolve_event_session_use_case.js';
import { createShowEventSessionUseCase } from '../application/show_event_session_use_case.js';
import { buildEventViewModel } from '../presentation/event_choice_view_model.js';

export function buildEventSessionApplicationCapabilities() {
  return {
    createDiscardEventCard: createDiscardEventCardUseCase,
    createFinishEventFlow: createFinishEventFlowUseCase,
    createResolveEventChoice: createResolveEventChoiceUseCase,
    createResolveEventSession: createResolveEventSessionUseCase,
    createShowEventSession: createShowEventSessionUseCase,
    buildViewModel: buildEventViewModel,
  };
}

export {
  buildEventViewModel,
  createDiscardEventCardUseCase,
  createFinishEventFlowUseCase,
  createResolveEventChoiceUseCase,
  createResolveEventSessionUseCase,
  createShowEventSessionUseCase,
  discardEventCard,
};
