import { createResolveEventChoiceUseCase } from '../resolve_event_choice_use_case.js';
import { resolveEventEffectServices } from '../../ports/event_effect_service_ports.js';

export function resolveEventChoiceExecution({
  audioEngine,
  choiceIdx,
  deps = {},
  event,
  gs,
  resolveChoice,
  sharedData = deps?.data || {},
} = {}) {
  const effectServices = resolveEventEffectServices(deps, { audioEngine });
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
