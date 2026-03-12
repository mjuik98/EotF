import { buildCombatRuntimeSubscriberActions } from '../app/build_runtime_subscriber_actions.js';

export function buildCombatRuntimeSubscriberPublicActions(fns) {
  return buildCombatRuntimeSubscriberActions(fns);
}
