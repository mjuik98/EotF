import { registerCardEventSubscribers } from './event_subscribers_card_events.js';
import { registerCombatEventSubscribers } from './event_subscribers_combat_events.js';
import { registerPlayerEventSubscribers } from './event_subscribers_player_events.js';
import { registerRuntimeEventSubscribers } from './event_subscribers_runtime_events.js';

export function buildEventSubscriberRegistrars() {
  return [
    registerPlayerEventSubscribers,
    registerCardEventSubscribers,
    registerCombatEventSubscribers,
    registerRuntimeEventSubscribers,
  ];
}
