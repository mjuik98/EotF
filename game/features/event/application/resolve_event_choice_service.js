import { DATA } from '../../../../data/game_data.js';
import { EVENT_CHOICE_HANDLERS } from '../../../../data/events/effect_handlers.js';

export function resolveEventChoiceService({
  gs,
  event,
  choice,
  handlers = EVENT_CHOICE_HANDLERS,
  data = DATA,
  services = {},
}) {
  if (!choice?.effectId) return null;

  const handler = handlers[choice.effectId];
  if (typeof handler !== 'function') {
    throw new Error(`[resolve_event_choice_service] Unknown effectId: ${choice.effectId} (${event?.id || 'unknown event'})`);
  }

  return handler({ gs, event, choice, data, services });
}
