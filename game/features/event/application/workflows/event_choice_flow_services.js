import { createResolveEventChoiceUseCase } from '../resolve_event_choice_use_case.js';
import { createEventEffectServices } from '../../platform/browser/event_effect_services.js';

export function resolveEventChoiceExecution({
  audioEngine,
  choiceIdx,
  deps = {},
  event,
  gs,
  resolveChoice,
  sharedData = deps?.data || {},
} = {}) {
  const effectServices = deps.eventEffectServices || createEventEffectServices({
    audioEngine,
    showItemToast: deps.showItemToast,
  });
  const resolveEventChoice = createResolveEventChoiceUseCase(
    typeof resolveChoice === 'function'
      ? {
        resolveChoice: (runtimeGs, runtimeEvent, runtimeChoiceIdx) => (
          resolveChoice(runtimeGs, runtimeEvent, runtimeChoiceIdx, { services: effectServices })
        ),
      }
      : {
        resolveChoiceOptions: { services: effectServices },
      },
  );

  return resolveEventChoice({
    choiceIdx,
    event,
    gs,
    sharedData,
  });
}
