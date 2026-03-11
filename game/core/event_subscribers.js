import { EventBus } from './event_bus.js';
import { createEventSubscriberContext } from './event_subscriber_context.js';
import { registerCardEventSubscribers } from './event_subscribers_card_events.js';
import { registerCombatEventSubscribers } from './event_subscribers_combat_events.js';
import { registerPlayerEventSubscribers } from './event_subscribers_player_events.js';
import { registerRuntimeEventSubscribers } from './event_subscribers_runtime_events.js';

export function registerSubscribers(uiRefs = {}) {
  const ctx = createEventSubscriberContext(uiRefs);
  registerPlayerEventSubscribers(ctx);
  registerCardEventSubscribers(ctx);
  registerCombatEventSubscribers(ctx);
  registerRuntimeEventSubscribers(ctx);
}

export function clearSubscribers() {
  EventBus.clear();
}
