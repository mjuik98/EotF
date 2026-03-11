import { buildRuntimeSubscriberPayload } from './build_runtime_subscriber_payload.js';
import { registerSubscribers } from '../event_subscribers.js';

export function registerRuntimeSubscribers({ modules, fns, doc, win }) {
  registerSubscribers(buildRuntimeSubscriberPayload({ modules, fns, doc, win }));
}
