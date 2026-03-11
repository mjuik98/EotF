import { EventBus } from './event_bus.js';
import { buildEventSubscriberRegistrars } from './build_event_subscriber_registrars.js';
import { createEventSubscriberContext } from './event_subscriber_context.js';
import { executeEventSubscriberRegistration } from './execute_event_subscriber_registration.js';

export function registerSubscribers(uiRefs = {}) {
  const ctx = createEventSubscriberContext(uiRefs);
  executeEventSubscriberRegistration(ctx, buildEventSubscriberRegistrars());
}

export function clearSubscribers() {
  EventBus.clear();
}
