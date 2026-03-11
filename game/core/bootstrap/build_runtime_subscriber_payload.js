import { buildRuntimeSubscriberRefs } from './build_runtime_subscriber_refs.js';
import { buildRuntimeSubscriberActions } from './build_runtime_subscriber_actions.js';

export function buildRuntimeSubscriberPayload({ modules, fns, doc, win }) {
  return {
    ...buildRuntimeSubscriberRefs({ modules, doc, win }),
    actions: buildRuntimeSubscriberActions(fns),
  };
}
