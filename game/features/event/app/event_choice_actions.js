import { resolveEventChoiceService } from '../../../app/event/resolve_event_choice_service.js';
import {
  createEventChoiceResult,
  isEventChoiceDisabled,
  normalizeEventChoiceResult,
  pickRandomEventPolicy,
} from '../domain/event_choice_domain.js';

export { createEventChoiceResult } from '../domain/event_choice_domain.js';
export { createFailedEventChoiceResult } from '../domain/event_choice_domain.js';

export function resolveEventChoice(gs, event, choiceIdx, { resolveChoiceById = resolveEventChoiceService } = {}) {
  if (!event || !gs) return createEventChoiceResult(null, { shouldClose: true });
  const choice = event.choices?.[choiceIdx];
  if (!choice || (!choice.effectId && typeof choice.effect !== 'function')) {
    return createEventChoiceResult(null, { shouldClose: true });
  }
  if (isEventChoiceDisabled(choice, gs)) {
    return {
      resultText: choice?.disabledReason || '현재 선택할 수 없는 선택지입니다.',
      isFail: true,
      shouldClose: false,
      isItemShop: false,
    };
  }

  const result = choice.effectId
    ? resolveChoiceById({ gs, event, choice })
    : choice.effect(gs);

  return normalizeEventChoiceResult(event, result);
}

export function pickRandomEvent(gs, data) {
  return pickRandomEventPolicy(gs, data);
}
